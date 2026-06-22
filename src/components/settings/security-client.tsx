"use client";

import { useSession } from "@/lib/auth-client";
import { ChangePasswordCard } from "@/components/settings/change-password-card";
import { ChangeEmailCard } from "@/components/settings/change-email-card";
import { TwoFactorCard } from "@/components/settings/two-factor-card";

export function SecurityClient() {
  const { data: session } = useSession();
  const isEnabled = session?.user.twoFactorEnabled ?? false;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security</h2>
        <p className="text-muted-foreground">
          Manage your password, email, and two-factor authentication.
        </p>
      </div>

      <ChangePasswordCard />

      <ChangeEmailCard />

      <TwoFactorCard isEnabled={isEnabled} />
    </div>
  );
}
