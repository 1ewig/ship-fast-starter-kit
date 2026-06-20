"use client";

import type { SocialProvider } from "@/lib/auth-providers";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";

interface ProfileLayoutClientProps {
  availableProviders: SocialProvider[];
  children: React.ReactNode;
}

export function ProfileLayoutClient({
  availableProviders,
  children,
}: ProfileLayoutClientProps) {
  const {
    session,
    isSessionPending,
    isSigningOut,
    handleSignOut,
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
      <div className="flex flex-1 overflow-hidden">
        <ProfileSidebar onSignOut={handleSignOut} isSigningOut={isSigningOut} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
