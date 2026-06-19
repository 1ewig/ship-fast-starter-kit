"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

interface DashboardHeaderProps {
  onSignOut: () => Promise<void>;
  isSigningOut?: boolean;
}

export function DashboardHeader({ onSignOut, isSigningOut }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-xl font-semibold">SaaS Starter Kit</h1>
      <Button variant="outline" onClick={onSignOut} disabled={isSigningOut}>
        {isSigningOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut />
        )}
        {isSigningOut ? "Signing Out..." : "Sign Out"}
      </Button>
    </header>
  );
}

