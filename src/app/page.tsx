import type { Metadata } from "next";
import { DashboardClient } from "@/components/home/dashboard-client";
import { getAvailableProviders } from "@/lib/auth-providers";

export const metadata: Metadata = {
  title: "Dashboard | SaaS Starter Kit",
  description: "Your SaaS dashboard",
};

export default function HomePage() {
  const availableProviders = getAvailableProviders();

  return <DashboardClient availableProviders={availableProviders} />;
}
