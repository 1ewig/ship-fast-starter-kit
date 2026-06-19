"use client";

import { useSession, listAccounts } from "@/lib/auth-client";
import { DashboardHeader } from "@/components/home/dashboard-header";
import { ProfileCard } from "@/components/home/profile-card";
import { QuickActions } from "@/components/home/quick-actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Account {
  id: string;
  providerId: string;
  accountId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  scopes: string[];
}

export function HomeClient() {
  const { data: session, isPending } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      listAccounts().then(({ data }) => {
        if (data) setAccounts(data as Account[]);
      });
    }
  }, [session]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back{session.user.name ? `, ${session.user.name}` : ""}
            </h2>
            <p className="text-muted-foreground">
              You are signed in and ready to go.
            </p>
          </div>
          <ProfileCard session={session} accounts={accounts} />
          <QuickActions />
        </div>
      </main>
    </div>
  );
}
