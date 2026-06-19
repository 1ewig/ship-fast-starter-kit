"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut, unlinkAccount } from "@/lib/auth-client";
import { useHomeStore } from "@/stores/useHomeStore";
import { useRouter } from "next/navigation";

export function useHomeDashboard() {
  const { data: session, isPending: isSessionPending } = useSession();
  const accounts = useHomeStore((s) => s.accounts);
  const isLoadingAccounts = useHomeStore((s) => s.isLoadingAccounts);
  const fetchAccounts = useHomeStore((s) => s.fetchAccounts);
  
  const router = useRouter();
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Redirection when session is invalid
  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/sign-in");
    }
  }, [isSessionPending, session, router]);

  // Fetch linked accounts from the store on session load
  useEffect(() => {
    if (session) {
      fetchAccounts();
    }
  }, [session, fetchAccounts]);

  const handleUnlink = async (providerId: string) => {
    const hasCredentials = accounts.some((a) => a.providerId === "credential");
    if (!hasCredentials) {
      throw new Error("You must have a password login configured to disconnect social accounts.");
    }
    const { error } = await unlinkAccount({ providerId });
    if (error) {
      throw new Error(error.message || "Unlinking failed");
    }
    await fetchAccounts();
  };

  const handleLinkSocial = async (provider: "github" | "google") => {
    setIsLinking(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (err: any) {
      console.error(`Failed to link ${provider} account:`, err);
    } finally {
      setIsLinking(null);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("[useHomeDashboard] signOut failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    session,
    isSessionPending,
    accounts,
    isLoadingAccounts,
    isLinking,
    isSigningOut,
    handleUnlink,
    handleLinkSocial,
    handleSignOut,
  };
}
