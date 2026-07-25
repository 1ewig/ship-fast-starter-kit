import { db } from "@/db";
import { emailBudgetBucket } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface EmailBudgetConfig {
  maxTokens: number;
  refillIntervalMs: number;
}

export const DEFAULT_EMAIL_BUDGET_CONFIG: EmailBudgetConfig = {
  maxTokens: 5,
  refillIntervalMs: 12 * 60 * 1000, // 1 token refilled every 12 minutes (capacity 5/hr)
};

export class EmailBudgetExceededError extends Error {
  retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "EmailBudgetExceededError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * DB-backed Unified Token Bucket Rate Limiter for all outgoing emails.
 * Enforces global email send limits per target email address across all features
 * (verification, reset password, 2FA OTP, email change, etc.).
 */
export async function consumeEmailBudget(
  rawEmail: string,
  config: EmailBudgetConfig = DEFAULT_EMAIL_BUDGET_CONFIG
): Promise<{ success: true; remainingTokens: number }> {
  const normalized = rawEmail.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Invalid email address for rate limit calculation.");
  }

  const id = `email:${normalized}`;
  const now = new Date();

  const record = await db
    .select()
    .from(emailBudgetBucket)
    .where(eq(emailBudgetBucket.id, id))
    .then((rows) => rows[0] ?? null);

  if (!record) {
    // Initial creation: capacity - 1 tokens left
    const initialRemaining = config.maxTokens - 1;
    await db.insert(emailBudgetBucket).values({
      id,
      tokens: initialRemaining,
      maxTokens: config.maxTokens,
      lastRefilledAt: now,
      updatedAt: now,
    });
    return { success: true, remainingTokens: initialRemaining };
  }

  // Calculate token refill based on time elapsed
  const elapsedMs = Math.max(0, now.getTime() - new Date(record.lastRefilledAt).getTime());
  const refilledTokens = Math.floor(elapsedMs / config.refillIntervalMs);

  const currentMax = record.maxTokens || config.maxTokens;
  const currentTokens = Math.min(currentMax, record.tokens + refilledTokens);

  // If tokens refilled, advance lastRefilledAt by discrete steps
  const updatedLastRefilled =
    refilledTokens > 0
      ? new Date(new Date(record.lastRefilledAt).getTime() + refilledTokens * config.refillIntervalMs)
      : new Date(record.lastRefilledAt);

  if (currentTokens < 1) {
    const timeUntilNextTokenMs =
      config.refillIntervalMs - (elapsedMs % config.refillIntervalMs);
    const retryAfterSeconds = Math.ceil(timeUntilNextTokenMs / 1000);
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));

    throw new EmailBudgetExceededError(
      `Email limit reached for ${normalized}. Maximum ${currentMax} emails per hour. Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before requesting another email.`,
      retryAfterSeconds
    );
  }

  const remaining = currentTokens - 1;

  await db
    .update(emailBudgetBucket)
    .set({
      tokens: remaining,
      lastRefilledAt: updatedLastRefilled,
      updatedAt: now,
    })
    .where(eq(emailBudgetBucket.id, id));

  return { success: true, remainingTokens: remaining };
}
