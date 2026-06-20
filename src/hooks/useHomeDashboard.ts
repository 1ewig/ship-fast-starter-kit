"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut, unlinkAccount, linkSocial } from "@/lib/auth-client";
import { useHomeStore } from "@/stores/useHomeStore";
import { useRouter } from "next/navigation";
import type { SocialProvider } from "@/lib/auth-providers";

export function useHomeDashboard(availableProviders: SocialProvider[]) {
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
    if (session && accounts.length === 0) {
      fetchAccounts();
    }
  }, [session, fetchAccounts, accounts.length]);

  const handleUnlink = async (providerId: string) => {
    if (accounts.length <= 1) {
      throw new Error("You must have at least one other login method connected to disconnect this account.");
    }
    const { error } = await unlinkAccount({ providerId });
    if (error) {
      throw new Error(error.message || "Unlinking failed");
    }
    await fetchAccounts();
  };

  const handleLinkSocial = async (provider: SocialProvider) => {
    if (!availableProviders.includes(provider)) return;

    setIsLinking(provider);
    try {
      const { data, error } = await linkSocial({
        provider,
        callbackURL: "/",
      });
      if (error) {
        throw new Error(error.message || "Linking failed");
      }
      if (data?.url) {
        window.location.href = data.url;
      }
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
