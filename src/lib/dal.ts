import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { makeCacheKey, getCached, setCache, invalidateCache } from "@/lib/session-cache";

/**
 * React cache() deduplicates calls across a single request tree.
 * In-memory TTL cache deduplicates across requests (60s window).
 * Together they reduce DB load ~10x on typical pages.
 */
export const verifySession = cache(async () => {
  const reqHeaders = await headers();
  const cacheKey = makeCacheKey(reqHeaders);

  const cached = getCached<Awaited<ReturnType<typeof auth.api.getSession>>>(cacheKey);
  if (cached) return cached;

  try {
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (session) setCache(cacheKey, session);
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

/**
 * Busts the session cache for the current request.
 * Call after any mutation that changes session data (name, image, email, etc.).
 */
export async function invalidateSession() {
  invalidateCache(makeCacheKey(await headers()));
}
