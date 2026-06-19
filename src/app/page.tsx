import type { Metadata } from "next";
import { HomeClient } from "@/components/home/home-client";

export const metadata: Metadata = {
  title: "Dashboard | SaaS Starter Kit",
  description: "Your SaaS dashboard",
};

export default function HomePage() {
  return <HomeClient />;
}
