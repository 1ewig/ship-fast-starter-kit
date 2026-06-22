import type { Metadata } from "next";
import { SecurityClient } from "@/components/settings/security-client";

export const metadata: Metadata = {
  title: "Security | SaaS Starter Kit",
};

export default function SecurityPage() {
  return <SecurityClient />;
}
