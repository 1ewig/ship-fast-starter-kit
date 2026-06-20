"use client";

import { useState, useEffect } from "react";
import { signIn, signUp, authClient } from "@/lib/auth-client";
import { checkAccountExists } from "@/lib/actions/check-account";
import type { SocialProvider } from "@/lib/auth-providers";

export type AccountStatus =
  | "verified"
  | "unverified"
  | "oauth_only"
  | "banned"
  | null;

export function useSignUpForm(availableProviders: SocialProvider[]) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(null);

  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 10) {
      newErrors.password = "Password must be at least 10 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});
    setAccountStatus(null);

    if (!validate()) return;

    setIsLoading(true);

    const check = await checkAccountExists(email);

    if (check.exists) {
      setIsLoading(false);
      setAccountStatus(check.status);

      switch (check.status) {
        case "verified":
          setGeneralError(
            "An account with this email already exists. Try signing in instead."
          );
          break;
        case "unverified":
          setGeneralError(
            "An account with this email exists but hasn't been verified yet."
          );
          break;
        case "oauth_only":
          setGeneralError(
            `An account with this email exists. Try signing in with ${check.provider === "github" ? "GitHub" : "Google"} instead.`
          );
          break;
        case "banned":
          setGeneralError("This account has been suspended.");
          break;
      }
      return;
    }

    const { error } = await signUp.email({ email, password, name });

    if (error) {
      const msg = error.message?.toLowerCase() || "";

      if (error.status === 429) {
        setGeneralError(
          "Too many requests. Please wait a moment before trying again."
        );
      } else if (msg.includes("already") || msg.includes("exist")) {
        setGeneralError(
          "An account with this email already exists. Try signing in instead."
        );
      } else if (msg.includes("email")) {
        setErrors((p) => ({
          ...p,
          email: error.message || "Invalid email address",
        }));
      } else {
        setGeneralError(
          error.message || "Something went wrong. Please try again."
        );
      }

      setIsLoading(false);
      return;
    }

    setSubmittedEmail(email);
    setSuccess(true);
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    const targetEmail = submittedEmail || email;
    if (!targetEmail) return;
    setIsResending(true);
    setResendSuccess("");
    setResendError("");

    const { error } = await authClient.sendVerificationEmail({
      email: targetEmail,
      callbackURL: "/",
    });

    setIsResending(false);

    if (error) {
      if (error.status === 429) {
        setResendError("Too many requests. Please wait before trying again.");
      } else {
        setResendError(error.message || "Failed to resend verification email.");
      }
    } else {
      setResendSuccess("Verification email sent! Check your inbox.");
      setResendCooldown(60);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    if (!availableProviders.includes(provider)) return;
    setSocialLoading(provider);
    setGeneralError("");
    setResendSuccess("");
    setResendError("");
    setAccountStatus(null);
    await signIn.social({ provider });
    setSocialLoading("");
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isLoading,
    socialLoading,
    errors,
    setErrors,
    generalError,
    accountStatus,
    success,
    submittedEmail,
    isResending,
    resendCooldown,
    resendSuccess,
    resendError,
    handleSubmit,
    handleResendVerification,
    handleSocialLogin,
  };
}
