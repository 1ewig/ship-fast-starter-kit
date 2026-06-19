"use client";

import { useState, useEffect } from "react";
import { signIn, authClient } from "@/lib/auth-client";

export function useSignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    const storedCooldown = localStorage.getItem("verification_resend_cooldown");
    if (storedCooldown) {
      const timeRemaining = Math.ceil(
        (parseInt(storedCooldown, 10) - Date.now()) / 1000
      );
      if (timeRemaining > 0) {
        setResendCooldown(timeRemaining);
      } else {
        localStorage.removeItem("verification_resend_cooldown");
      }
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("verification_resend_cooldown");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setResendSuccess("");
    setIsEmailUnverified(false);
    setIsLoading(true);

    const { error } = await signIn.email({ email, password });

    if (error) {
      const msg = error.message?.toLowerCase() || "";

      if (error.status === 401) {
        setGeneralError("Invalid email or password");
      } else if (
        error.status === 403 ||
        msg.includes("verify") ||
        msg.includes("verification")
      ) {
        setGeneralError("Please verify your email address before signing in.");
        setIsEmailUnverified(true);
      } else if (error.status === 429) {
        setGeneralError(
          "Too many sign-in attempts. Please wait a few minutes."
        );
      } else if (error.status === 404) {
        setGeneralError("No account found with this email address.");
      } else {
        setGeneralError(
          error.message || "Something went wrong. Please try again."
        );
      }

      setIsLoading(false);
      return;
    }

    window.location.href = "/";
  };

  const handleResendVerification = async () => {
    if (!email) {
      setGeneralError("Please enter your email address first.");
      return;
    }
    setIsResending(true);
    setResendSuccess("");
    setGeneralError("");

    const { error } = await authClient.sendVerificationEmail({
      email: email.trim().toLowerCase(),
      callbackURL: "/",
    });

    setIsResending(false);

    if (error) {
      const message =
        error.status === 429
          ? "Too many requests. Please wait a bit before trying again."
          : error.message || "Failed to resend verification email.";
      setGeneralError(message);
    } else {
      setResendSuccess("Verification email sent! Check your inbox.");
      const targetTime = Date.now() + 60000;
      localStorage.setItem("verification_resend_cooldown", targetTime.toString());
      setResendCooldown(60);
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    setSocialLoading(provider);
    setGeneralError("");
    setResendSuccess("");
    setIsEmailUnverified(false);
    await signIn.social({ provider });
    setSocialLoading("");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    socialLoading,
    errors,
    setErrors,
    generalError,
    isResending,
    resendCooldown,
    isEmailUnverified,
    resendSuccess,
    handleSubmit,
    handleResendVerification,
    handleSocialLogin,
  };
}
