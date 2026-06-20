"use client";

import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import { QuickActions } from "@/components/home/quick-actions";
import type { SocialProvider } from "@/lib/auth-providers";

export function DashboardClient({
  availableProviders,
}: {
  availableProviders: SocialProvider[];
}) {
  const {
    session,
    isSessionPending,
  } = useHomeDashboard(availableProviders);

  if (isSessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back{session.user.name ? `, ${session.user.name}` : ""}
            </h2>
            <p className="text-muted-foreground">
              You are signed in and ready to go.
            </p>
          </div>
          <QuickActions />
        </div>
      </main>
    </div>
  );
}
