const baseStyle = "font-family: sans-serif; padding: 20px; line-height: 1.5;";
const btnStyle = "background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;";
const otpStyle = "font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f4f4f4; padding: 12px 24px; border-radius: 8px;";

function greet(name: string | null) {
  return `Hi ${name || "there"}`;
}

export function passwordResetHtml(name: string | null, url: string): string {
  return `
    <div style="${baseStyle}">
      <h2>Password Reset Request</h2>
      <p>${greet(name)},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <div style="margin: 20px 0;">
        <a href="${url}" style="${btnStyle}">Reset Password</a>
      </div>
      <p>If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}

export function emailVerificationHtml(name: string | null, url: string): string {
  return `
    <div style="${baseStyle}">
      <h2>Verify Your Email Address</h2>
      <p>${greet(name)},</p>
      <p>Welcome to SaaS Starter Kit! Please verify your email address by clicking the button below:</p>
      <div style="margin: 20px 0;">
        <a href="${url}" style="${btnStyle}">Verify Email</a>
      </div>
      <p>Looking forward to having you on board.</p>
    </div>
  `;
}

export function passwordChangeOtpHtml(name: string | null, otp: string): string {
  return `
    <div style="${baseStyle}">
      <h2>Password Change Request</h2>
      <p>${greet(name)},</p>
      <p>We received a request to change your password. Use the following OTP to confirm:</p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="${otpStyle}">${otp}</span>
      </div>
      <p>This code expires in <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}

export function emailChangeOtpHtml(name: string | null, otp: string): string {
  return `
    <div style="${baseStyle}">
      <h2>Email Change Request</h2>
      <p>${greet(name)},</p>
      <p>Use the following code to verify your new email address:</p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="${otpStyle}">${otp}</span>
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}

export function twoFactorOtpHtml(name: string | null, otp: string): string {
  return `
    <div style="${baseStyle}">
      <h2>Two-Factor Authentication Code</h2>
      <p>${greet(name)},</p>
      <p>Use the following code to complete your sign-in:</p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="${otpStyle}">${otp}</span>
      </div>
      <p>This code expires in <strong>3 minutes</strong>.</p>
      <p>If you didn't attempt to sign in, please secure your account immediately.</p>
    </div>
  `;
}

export function emailChangedNotificationHtml(name: string | null, newEmail: string): string {
  return `
    <div style="${baseStyle}">
      <h2>Email Address Changed</h2>
      <p>${greet(name)},</p>
      <p>Your email address has been changed to <strong>${newEmail}</strong>.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    </div>
  `;
}
