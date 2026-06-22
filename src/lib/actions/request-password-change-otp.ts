"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { setOtp } from "@/lib/otp-store";
import { sendEmail } from "@/lib/email";
import crypto from "node:crypto";

export type RequestOtpResult =
  | { success: true }
  | { success: false; error: string };

export async function requestPasswordChangeOtp(): Promise<RequestOtpResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not authenticated." };

  const user = session.user;
  if (!user.emailVerified) {
    return { success: false, error: "Email must be verified to change password." };
  }

  const otp = crypto.randomInt(100_000, 999_999).toString();
  setOtp(user.id, otp);

  try {
    await sendEmail({
      to: user.email,
      subject: "Your password change OTP",
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
          <h2>Password Change Request</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>We received a request to change your password. Use the following OTP to confirm:</p>
          <div style="margin: 20px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f4f4f4; padding: 12px 24px; border-radius: 8px;">${otp}</span>
          </div>
          <p>This code expires in <strong>5 minutes</strong>.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send OTP email." };
  }

  return { success: true };
}
