"use server";

import { db } from "@/db";
import { user, account } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AccountCheckResult =
  | { exists: false }
  | { exists: true; status: "verified" }
  | { exists: true; status: "unverified" }
  | { exists: true; status: "oauth_only"; provider: string }
  | { exists: true; status: "banned" };

export async function checkAccountExists(
  email: string
): Promise<AccountCheckResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const rows = await db
    .select()
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1);

  const existingUser = rows[0];

  if (!existingUser) {
    return { exists: false };
  }

  if (existingUser.banned) {
    return { exists: true, status: "banned" };
  }

  if (!existingUser.emailVerified) {
    return { exists: true, status: "unverified" };
  }

  const accounts = await db
    .select()
    .from(account)
    .where(eq(account.userId, existingUser.id));

  const hasCredential = accounts.some((a) => a.providerId === "credential");

  if (hasCredential) {
    return { exists: true, status: "verified" };
  }

  const oauthAccount = accounts.find(
    (a) => a.providerId === "github" || a.providerId === "google"
  );

  return {
    exists: true,
    status: "oauth_only",
    provider: oauthAccount?.providerId || "social",
  };
}
