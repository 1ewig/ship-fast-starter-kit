const OTP_TTL_MS = 5 * 60 * 1000;

const store = new Map<string, { otp: string; expiresAt: number }>();

export function setOtp(userId: string, otp: string): void {
  store.set(userId, { otp, expiresAt: Date.now() + OTP_TTL_MS });
}

export function getOtp(userId: string): string | null {
  const entry = store.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(userId);
    return null;
  }
  return entry.otp;
}

export function deleteOtp(userId: string): void {
  store.delete(userId);
}
