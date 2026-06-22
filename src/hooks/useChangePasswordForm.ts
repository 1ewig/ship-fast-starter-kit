"use client";

import { useState, useEffect } from "react";
import { requestPasswordChangeOtp } from "@/lib/actions/request-password-change-otp";
import { confirmPasswordChange } from "@/lib/actions/confirm-password-change";

export type Step = "form" | "otp" | "done";

export function useChangePasswordForm() {
  const [step, setStep] = useState<Step>("form");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const result = await requestPasswordChangeOtp();
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setStep("otp");
    setResendCooldown(60);
  };

  const handleResendOtp = async () => {
    setError("");
    setOtp("");
    setIsLoading(true);
    const result = await requestPasswordChangeOtp();
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setResendCooldown(60);
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setIsLoading(true);
    const result = await confirmPasswordChange(otp, newPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setStep("done");
  };

  const handleReset = () => {
    setStep("form");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setError("");
    setResendCooldown(0);
  };

  return {
    step,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    otp,
    setOtp,
    isLoading,
    error,
    resendCooldown,
    handleSendOtp,
    handleResendOtp,
    handleConfirmOtp,
    handleReset,
  };
}
