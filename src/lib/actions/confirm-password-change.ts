"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { account } from "@/db/schema";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { getOtp, deleteOtp } from "@/lib/otp-store";
import { hashPassword as hashPw } from "@better-auth/utils/password";
import { checkRateLimit } from "@/lib/rate-limit-store";

export type ConfirmOtpResult =
  | { success: true; error?: never }
  | { success: false; error: string };

export async function confirmPasswordChange(
  otp: string,
  newPassword: string
): Promise<ConfirmOtpResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not authenticated." };

  const userId = session.user.id;

  const storedOtp = getOtp(userId);
  if (!storedOtp) {
    return { success: false, error: "OTP expired or not found. Request a new one." };
  }

  if (storedOtp !== otp) {
    return { success: false, error: "Invalid OTP code." };
  }

  if (!checkRateLimit("password-confirm:" + userId, 5, 60_000)) {
    return { success: false, error: "Too many attempts. Please wait before trying again." };
  }

  if (newPassword.length < 10) {
    return { success: false, error: "Password must be at least 10 characters." };
  }

  const credentialAccount = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
    .then((rows) => rows[0] ?? null);

  if (!credentialAccount) {
    return { success: false, error: "No password account found." };
  }

  try {
    const passwordHash = await hashPw(newPassword);
    await db
      .update(account)
      .set({ password: passwordHash })
      .where(eq(account.id, credentialAccount.id));

    await auth.api.revokeOtherSessions({ headers: await headers() });
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update password." };
  }

  deleteOtp(userId);

  return { success: true };
}
