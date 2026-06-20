"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

const ERROR_MAP: Record<string, { title: string; message: string }> = {
  "email_doesn't_match": {
    title: "Email Mismatch",
    message: "The email address from your social account doesn't match your current account email. To connect this account, sign in with that social provider first, or use a different social account that uses the same email address as your account.",
  },
  account_not_linked: {
    title: "Verification Required",
    message: "An account with this email address already exists. To connect your social account, please log in with your password first, then link it from your account profile settings.",
  },
  account_already_linked_to_different_user: {
    title: "Connection Conflict",
    message: "This social account is already connected to a different user on our platform.",
  },
  unable_to_link_account: {
    title: "Connection Failed",
    message: "The database was unable to complete the connection request. Your verification session may have expired.",
  },
  state_mismatch: {
    title: "Session Expired",
    message: "The secure verification request timed out. Please try signing in again.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error") || "default";

  const errorInfo = ERROR_MAP[errorKey] || {
    title: "Authentication Error",
    message: "An unexpected error occurred during the authentication process. Please try again.",
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-8 shadow-lg shadow-destructive/5 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {errorInfo.message}
          </p>
          <div className="w-full space-y-3">
            <Link
              href="/sign-in"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              <ArrowLeft className="size-4" />
              Return to Sign In
            </Link>
            <Link
              href="mailto:support@yourdomain.com"
              className="flex w-full items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
