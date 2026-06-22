import type { Metadata } from "next";
import { ProfileInfoClient } from "@/components/settings/profile-info-client";
import { getAvailableProviders } from "@/lib/auth-providers";

export const metadata: Metadata = {
  title: "Profile | SaaS Starter Kit",
};

export default function ProfileInfoPage() {
  const availableProviders = getAvailableProviders();

  return <ProfileInfoClient availableProviders={availableProviders} />;
}
