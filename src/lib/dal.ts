import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * React cache() deduplicates calls across a single request tree.
 * Checking session multiple times in one layout/page tree result in only 1 database query.
 */
export const verifySession = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session ?? null;
  } catch (error) {
    console.error("[DAL] verifySession failed:", error);
    return null;
  }
});

/**
 * Guards protected pages and layouts.
 * Redirects unauthenticated users to the login page.
 */
export const requireAuth = cache(async () => {
  const session = await verifySession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
});

/**
 * Guards admin-only layout blocks.
 * Redirects non-admins to the home route.
 */
export const requireAdmin = cache(async () => {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
});
