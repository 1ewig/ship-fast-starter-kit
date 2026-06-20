"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSidebarProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

const navItems = [
  { href: "/profile/info", label: "Profile", icon: User },
  { href: "/profile/security", label: "Security", icon: Shield },
  { href: "/profile/billing", label: "Billing", icon: CreditCard },
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r p-4 space-y-6">
      <div className="flex items-center gap-3 px-2">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "Avatar"}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {getInitials(user.name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.name || "No name"}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

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
    </nav>
  );
}
