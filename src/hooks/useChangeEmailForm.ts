"use client";

import { useState, useEffect } from "react";
import { checkNewEmail, sendEmailChangeOtp, confirmEmailChange } from "@/lib/actions/change-email";

export type Stage = "email" | "password" | "otp" | "done";

export function useChangeEmailForm() {
  const [stage, setStage] = useState<Stage>("email");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newEmail.trim()) {
      setError("Please enter your new email address.");
      return;
    }

    setIsLoading(true);
    const result = await checkNewEmail(newEmail);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setStage("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    setIsLoading(true);
    const result = await sendEmailChangeOtp(newEmail, currentPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setStage("otp");
    setResendCooldown(120);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setIsLoading(true);
    const result = await confirmEmailChange(otp);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setStage("done");
  };

  const handleReset = () => {
    setStage("email");
    setNewEmail("");
    setCurrentPassword("");
    setOtp("");
    setError("");
    setResendCooldown(0);
  };

  const handleBackToEmail = () => {
    setStage("email");
    setError("");
  };

  return {
    stage,
    newEmail,
    setNewEmail,
    currentPassword,
    setCurrentPassword,
    otp,
    setOtp,
    isLoading,
    error,
    resendCooldown,
    handleEmailSubmit,
    handlePasswordSubmit,
    handleOtpSubmit,
    handleReset,
    handleBackToEmail,
  };
}
