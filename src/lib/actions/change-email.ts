"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, account } from "@/db/schema";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { setPendingEmail, getPendingEmail, deletePendingEmail } from "@/lib/pending-email-store";
import { verifyPassword as verifyPw } from "@better-auth/utils/password";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit-store";
import { emailChangeOtpHtml, emailChangedNotificationHtml } from "@/lib/email-templates";
import crypto from "node:crypto";

export type CheckEmailResult =
  | { success: true }
  | { success: false; error: string };

export async function checkNewEmail(newEmail: string): Promise<CheckEmailResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not authenticated." };

  const normalized = newEmail.trim().toLowerCase();

  if (normalized === session.user.email?.toLowerCase()) {
    return { success: false, error: "This is already your current email." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, normalized))
    .then((rows) => rows[0] ?? null);

  if (existing) {
    return { success: false, error: "This email address is already in use by another account." };
  }

  return { success: true };
}

export type SendOtpResult =
  | { success: true }
  | { success: false; error: string };

export async function sendEmailChangeOtp(newEmail: string, currentPassword: string): Promise<SendOtpResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not authenticated." };

  const userId = session.user.id;
  const normalized = newEmail.trim().toLowerCase();

  if (normalized === session.user.email?.toLowerCase()) {
    return { success: false, error: "This is already your current email." };
  }

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, normalized))
    .then((rows) => rows[0] ?? null);

  if (existing) {
    return { success: false, error: "This email address is already in use." };
  }

  const credentialAccount = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
    .then((rows) => rows[0] ?? null);

  if (!credentialAccount?.password) {
    return { success: false, error: "No password account found." };
  }

  if (!checkRateLimit("change-email-otp:" + userId, 3, 60_000)) {
    return { success: false, error: "Too many requests. Please wait before trying again." };
  }

  const valid = await verifyPw(credentialAccount.password, currentPassword);
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }

  const otp = crypto.randomInt(100_000, 999_999).toString();
  setPendingEmail(userId, normalized, otp);

  try {
    await sendEmail({
      to: normalized,
      subject: "Verify your new email address",
      html: emailChangeOtpHtml(session.user.name, otp),
    });
  } catch (err: any) {
    deletePendingEmail(userId);
    return { success: false, error: err.message || "Failed to send verification email." };
  }

  return { success: true };
}

export type ConfirmEmailResult =
  | { success: true }
  | { success: false; error: string };

export async function confirmEmailChange(otp: string): Promise<ConfirmEmailResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not authenticated." };

  const userId = session.user.id;
  const oldEmail = session.user.email!;

  if (!checkRateLimit("email-confirm:" + userId, 5, 60_000)) {
    return { success: false, error: "Too many attempts. Please wait before trying again." };
  }

  const pending = getPendingEmail(userId);
  if (!pending) {
    return { success: false, error: "Verification code expired or not found. Start over." };
  }

  if (pending.otp !== otp) {
    return { success: false, error: "Invalid verification code." };
  }

  const newEmail = pending.newEmail;

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, newEmail))
    .then((rows) => rows[0] ?? null);

  if (existing && existing.id !== userId) {
    deletePendingEmail(userId);
    return { success: false, error: "This email was taken while you were verifying." };
  }

  try {
    await db
      .update(user)
      .set({ email: newEmail, emailVerified: true })
      .where(eq(user.id, userId));

    await auth.api.revokeOtherSessions({ headers: await headers() });
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update email." };
  }

  deletePendingEmail(userId);

  try {
    await sendEmail({
      to: oldEmail,
      subject: "Your email address has been changed",
      html: emailChangedNotificationHtml(session.user.name, newEmail),
    });
  } catch {
    // Notification to old email is best-effort
  }

  return { success: true };
}
