"use client";

import { useState } from "react";
import { signIn, sendVerificationEmail } from "@/lib/auth-client";
import { checkAccountExists } from "@/lib/actions/check-account";
import type { SocialProvider } from "@/lib/auth-providers";
import { useCooldown } from "@/hooks/useCooldown";

export function useSignInForm(availableProviders: SocialProvider[]) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const {
    cooldown: resendCooldown,
    start: startResendCooldown,
  } = useCooldown("verification");
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setResendSuccess("");
    setIsEmailUnverified(false);
    setIsLoading(true);

    const check = await checkAccountExists(email);
    if (check.exists && check.status === "oauth_only") {
      setIsLoading(false);
      setGeneralError(
        `An account with this email exists. Try signing in with ${
          check.provider === "github" ? "GitHub" : "Google"
        } instead.`
      );
      return;
    }

    const res = await signIn.email({ email, password });
    const { error } = res;

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

    if (
      res.data &&
      typeof res.data === "object" &&
      "twoFactorRedirect" in res.data &&
      res.data.twoFactorRedirect === true
    ) {
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

    const { error } = await sendVerificationEmail({
      email: email.trim().toLowerCase(),
      callbackURL: "/",
    });

    setIsResending(false);

    if (error) {
      if (error.status === 429) {
        startResendCooldown(60);
      }
      setGeneralError(error.message || "Failed to send verification email.");
    } else {
      setResendSuccess("Verification email sent! Check your inbox.");
      startResendCooldown(60);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    if (!availableProviders.includes(provider)) return;
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
