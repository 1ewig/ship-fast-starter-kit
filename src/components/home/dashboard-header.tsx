import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-xl font-semibold">SaaS Starter Kit</h1>
      <Button variant="outline" onClick={() => signOut()}>
        <LogOut />
        Sign Out
      </Button>
    </header>
  );
}
