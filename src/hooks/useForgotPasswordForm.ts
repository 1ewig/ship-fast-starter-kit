"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";

export function useForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);

    const { error: reqError } = await requestPasswordReset({
      email: email.trim().toLowerCase(),
      redirectTo: "/reset-password",
    });

    setIsLoading(false);

    if (reqError) {
      if (reqError.status === 429) {
        setError("Too many requests. Please wait a moment before trying again.");
      } else {
        setError(reqError.message || "Something went wrong. Please try again.");
      }
      return;
    }

    setSuccess(true);
  };

  const handleTryAnother = () => {
    setSuccess(false);
    setEmail("");
  };

  return {
    email,
    setEmail,
    isLoading,
    error,
    success,
    handleSubmit,
    handleTryAnother,
  };
}
