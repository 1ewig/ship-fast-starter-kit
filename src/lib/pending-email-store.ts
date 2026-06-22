const TTL_MS = 10 * 60 * 1000;

const store = new Map<string, { newEmail: string; otp: string; expiresAt: number }>();

export function setPendingEmail(userId: string, newEmail: string, otp: string): void {
  store.set(userId, { newEmail, otp, expiresAt: Date.now() + TTL_MS });
}

export function getPendingEmail(userId: string): { newEmail: string; otp: string } | null {
  const entry = store.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(userId);
    return null;
  }
  return { newEmail: entry.newEmail, otp: entry.otp };
}

export function deletePendingEmail(userId: string): void {
  store.delete(userId);
}
