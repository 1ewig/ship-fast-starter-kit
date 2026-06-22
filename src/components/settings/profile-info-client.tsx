"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { SocialAccounts } from "@/components/settings/social-accounts";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import type { SocialProvider } from "@/lib/auth-providers";

interface ProfileInfoClientProps {
  availableProviders: SocialProvider[];
}

export function ProfileInfoClient({ availableProviders }: ProfileInfoClientProps) {
  const {
    session,
    accounts,
    isLoadingAccounts,
    isLinking,
    handleUnlink,
    handleLinkSocial,
  } = useHomeDashboard(availableProviders);

  if (!session) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted-foreground">
          Manage your avatar, display name, and connected accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo & Display Name</CardTitle>
          <CardDescription>Your profile photo and display name visible to other users.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload user={session.user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Connect or disconnect your social sign-in methods.</CardDescription>
        </CardHeader>
        <CardContent>
          <SocialAccounts
            accounts={accounts}
            isLoadingAccounts={isLoadingAccounts}
            onUnlink={handleUnlink}
            onLinkSocial={handleLinkSocial}
            isLinking={isLinking}
            availableProviders={availableProviders}
          />
        </CardContent>
      </Card>
    </div>
  );
}
