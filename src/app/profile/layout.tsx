import { ProfileLayoutClient } from "@/components/profile/profile-layout-client";
import { getAvailableProviders } from "@/lib/auth-providers";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const availableProviders = getAvailableProviders();

  return (
    <ProfileLayoutClient availableProviders={availableProviders}>
      {children}
    </ProfileLayoutClient>
  );
}
