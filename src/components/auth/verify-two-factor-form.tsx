"use client";

import { useVerifyTwoFactor } from "@/hooks/useVerifyTwoFactor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";

export function VerifyTwoFactorForm() {
  const {
    step,
    code,
    setCode,
    error,
    resendCooldown,
    handleResend,
    handleVerify,
  } = useVerifyTwoFactor();

  if (step === "sending") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Sending verification code to your email...</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="space-y-4 py-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <Mail className="size-6 text-destructive" />
          </div>
          <p className="text-sm text-destructive text-center">{error}</p>
        </div>
        <div className="flex justify-center">
          <Button onClick={handleResend}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="size-6 text-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Enter the 6-digit code sent to your email.
        </p>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
          className="text-center text-lg tracking-[8px]"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="flex justify-center gap-2">
        <Button type="submit" disabled={code.length !== 6 || step === "verifying"}>
          {step === "verifying" ? (
            <>
              <Loader2 className="animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={resendCooldown > 0 || step === "verifying"}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
        </Button>
      </div>
    </form>
  );
}
