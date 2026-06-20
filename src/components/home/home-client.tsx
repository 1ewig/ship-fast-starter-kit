"use client";

import type { SocialProvider } from "@/lib/auth-providers";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import { useUpdateNameForm } from "@/hooks/useUpdateNameForm";
import { DashboardHeader } from "@/components/home/dashboard-header";
import { ProfileCard } from "@/components/home/profile-card";
import { QuickActions } from "@/components/home/quick-actions";

export function HomeClient({
  availableProviders,
}: {
  availableProviders: SocialProvider[];
}) {
  const {
    session,
    isSessionPending,
    accounts,
    isLoadingAccounts,
    isLinking,
    isSigningOut,
    handleUnlink,
    handleLinkSocial,
    handleSignOut,
  } = useHomeDashboard(availableProviders);

  const nameForm = useUpdateNameForm(session?.user?.name || "");

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
      <DashboardHeader onSignOut={handleSignOut} isSigningOut={isSigningOut} />
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
          <ProfileCard
            session={session}
            accounts={accounts}
            isLoadingAccounts={isLoadingAccounts}
            onUnlink={handleUnlink}
            onLinkSocial={handleLinkSocial}
            isLinking={isLinking}
            nameForm={nameForm}
            availableProviders={availableProviders}
          />
          <QuickActions />
        </div>
      </main>
    </div>
  );
}
