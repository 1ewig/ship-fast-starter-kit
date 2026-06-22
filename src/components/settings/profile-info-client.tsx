"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { NameForm } from "@/components/settings/name-form";
import { SocialAccounts } from "@/components/settings/social-accounts";
import { useHomeDashboard } from "@/hooks/useHomeDashboard";
import { useUpdateNameForm } from "@/hooks/useUpdateNameForm";
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

  const nameForm = useUpdateNameForm(session?.user?.name || "");

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
          <CardTitle>Photo</CardTitle>
          <CardDescription>Your profile picture is visible to other users.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload user={session.user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Name</CardTitle>
          <CardDescription>Your name visible across the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <NameForm nameForm={nameForm} />
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
