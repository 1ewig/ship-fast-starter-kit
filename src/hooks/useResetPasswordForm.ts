"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";

export function useResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);

    const { error } = await resetPassword({
      newPassword,
      token: token!,
    });

    setIsLoading(false);

    if (error) {
      const msg = error.message?.toLowerCase() || "";

      if (error.status === 429) {
        setGeneralError(
          "Too many requests. Please wait a moment before trying again."
        );
      } else if (
        msg.includes("invalid") ||
        msg.includes("expired") ||
        msg.includes("token")
      ) {
        setGeneralError("This reset link is invalid or has expired.");
      } else if (msg.includes("short") || msg.includes("length")) {
        setErrors((p) => ({
          ...p,
          newPassword: error.message || "Password is too short",
        }));
      } else {
        setGeneralError(
          error.message || "Something went wrong. Please try again."
        );
      }
      return;
    }

    setSuccess(true);
  };

  return {
    token,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isLoading,
    errors,
    setErrors,
    generalError,
    success,
    handleSubmit,
  };
}
