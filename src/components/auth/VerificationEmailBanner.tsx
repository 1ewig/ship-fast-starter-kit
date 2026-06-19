"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface VerificationEmailBannerProps {
  email: string;
  onResend: () => void;
  isResending: boolean;
  cooldown: number;
  resendSuccess?: string;
  resendError?: string;
}

export function VerificationEmailBanner({
  onResend,
  isResending,
  cooldown,
  resendSuccess,
  resendError,
}: VerificationEmailBannerProps) {
  return (
    <div className="space-y-2">
      {resendSuccess && (
        <p className="text-sm text-green-600 font-medium text-center">
          {resendSuccess}
        </p>
      )}
      {resendError && (
        <p className="text-sm text-destructive font-medium text-center">
          {resendError}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onResend}
        disabled={cooldown > 0 || isResending}
      >
        {isResending ? (
          <>
            <Loader2 className="animate-spin" />
            Sending...
          </>
        ) : cooldown > 0 ? (
          `Resend in ${cooldown}s`
        ) : (
          "Resend verification email"
        )}
      </Button>
    </div>
  );
}
