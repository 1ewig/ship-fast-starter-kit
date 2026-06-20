import type { Metadata } from "next";
import { BillingClient } from "@/components/profile/billing-client";

export const metadata: Metadata = {
  title: "Billing | SaaS Starter Kit",
};

export default function BillingPage() {
  return <BillingClient />;
}
