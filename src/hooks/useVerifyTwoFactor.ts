"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export type VerifyStep = "sending" | "ready" | "verifying" | "done" | "error";

const MAX_ATTEMPTS = 3;

export function useVerifyTwoFactor() {
  const router = useRouter();
  const [step, setStep] = useState<VerifyStep>("sending");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const sendOtp = useCallback(async () => {
    setStep("sending");
    setError("");

    const { error: apiError } = await authClient.twoFactor.sendOtp();

    if (apiError) {
      if (apiError.status === 401) {
        setStep("error");
        setError("Your session expired. Please sign in again.");
        setTimeout(() => router.push("/sign-in"), 2000);
        return;
      }
      setStep("error");
      setError(apiError.message || "Failed to send verification code.");
      return;
    }

    setStep("ready");
    setResendCooldown(60);
  }, [router]);

  useEffect(() => {
    sendOtp();
  }, [sendOtp]);

  const handleResend = async () => {
    setCode("");
    setAttemptCount(0);
    await sendOtp();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setStep("verifying");

    const { data, error: apiError } = await authClient.twoFactor.verifyOtp({ code });

    if (apiError) {
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      setStep("ready");
      setCode("");

      if (newCount >= MAX_ATTEMPTS) {
        setError("Too many incorrect attempts. Please request a new code.");
        setAttemptCount(0);
        return;
      }

      const remaining = MAX_ATTEMPTS - newCount;
      setError(`Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
      return;
    }

    setStep("done");
    router.push("/");
  };

  return {
    step,
    code,
    setCode,
    error,
    resendCooldown,
    attemptCount,
    handleResend,
    handleVerify,
  };
}
