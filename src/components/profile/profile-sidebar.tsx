"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, CreditCard, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/security", label: "Security", icon: Shield },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

interface ProfileSidebarProps {
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
}

export function ProfileSidebar({ onSignOut, isSigningOut }: ProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r p-4 flex flex-col sticky top-0 h-screen">
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-1 pt-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Exit Settings
        </Link>
        <button
          onClick={onSignOut}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </button>
      </div>
    </nav>
  );
}
