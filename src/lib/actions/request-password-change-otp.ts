"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { setOtp } from "@/lib/otp-store";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit-store";
import { passwordChangeOtpHtml } from "@/lib/email-templates";
import crypto from "node:crypto";

export type RequestOtpResult =
  | { success: true }
  | { success: false; error: string };

export async function requestPasswordChangeOtp(newPassword: string): Promise<RequestOtpResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not authenticated." };

  const user = session.user;
  if (!user.emailVerified) {
    return { success: false, error: "Email must be verified to change password." };
  }

  if (newPassword.length < 10) {
    return { success: false, error: "Password must be at least 10 characters." };
  }

  if (!checkRateLimit("password-otp:" + user.id, 3, 60_000)) {
    return { success: false, error: "Too many requests. Please wait before trying again." };
  }

  const otp = crypto.randomInt(100_000, 999_999).toString();
  setOtp(user.id, otp);

  try {
    await sendEmail({
      to: user.email,
      subject: "Your password change OTP",
      html: passwordChangeOtpHtml(user.name, otp),
    });
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send OTP email." };
  }

  return { success: true };
}
