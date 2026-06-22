"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export type TwoFactorStep = "idle" | "enabling" | "disabling";

export function useTwoFactorSetup(isEnabled: boolean) {
  const [step, setStep] = useState<TwoFactorStep>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEnable = async (password: string) => {
    setError("");
    setIsLoading(true);

    const { error: apiError } = await authClient.twoFactor.enable({ password });

    setIsLoading(false);

    if (apiError) {
      setError(apiError.message || "Failed to enable two-factor authentication.");
      return false;
    }

    setStep("idle");
    return true;
  };

  const handleDisable = async (password: string) => {
    setError("");
    setIsLoading(true);

    const { error: apiError } = await authClient.twoFactor.disable({ password });

    setIsLoading(false);

    if (apiError) {
      setError(apiError.message || "Failed to disable two-factor authentication.");
      return false;
    }

    setStep("idle");
    return true;
  };

  return {
    step,
    setStep,
    isLoading,
    error,
    handleEnable,
    handleDisable,
  };
}
