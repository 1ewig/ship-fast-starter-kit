"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { signUp, authClient } from "@/lib/auth-client";
import { checkAccountExists } from "@/lib/actions/check-account";

import { Loader2, Eye, EyeOff, MailCheck } from "lucide-react";

type AccountStatus =
  | "verified"
  | "unverified"
  | "oauth_only"
  | "banned"
  | null;

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="size-6 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">Check your email</CardTitle>
                <CardDescription>
                  We sent a verification link to{" "}
                  <span className="font-medium text-foreground">
                    {submittedEmail}
                  </span>
                </CardDescription>
              </div>
              <p className="text-sm text-muted-foreground">
                Please verify your email before signing in. Check your spam
                folder if you don&apos;t see it.
              </p>

              {resendSuccess && (
                <p className="text-sm text-green-600 font-medium">
                  {resendSuccess}
                </p>
              )}
              {resendError && (
                <p className="text-sm text-destructive font-medium">
                  {resendError}
                </p>
              )}

              <div className="flex flex-col gap-2 w-full pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0 || isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    "Resend verification email"
                  )}
                </Button>
                <a
                  href="/sign-in"
                  className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 text-center pt-1"
                >
                  Back to sign in
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              {generalError && (
                <div className="space-y-2">
                  <FieldError
                    errors={[{ message: generalError }]}
                    className="text-center"
                  />
                  {accountStatus === "verified" && (
                    <a
                      href="/sign-in"
                      className="block text-center text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Go to sign in
                    </a>
                  )}
                  {accountStatus === "unverified" && (
                    <div className="space-y-2">
                      {resendSuccess && (
                        <p className="text-sm text-green-600 font-medium text-center">
                          {resendSuccess}
                        </p>
                      )}
                      {resendError && (
                        <p className="text-sm text-destructive font-medium text-center">
                          {resendError}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={resendCooldown > 0 || isResending}
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="animate-spin" />
                            Sending...
                          </>
                        ) : resendCooldown > 0 ? (
                          `Resend in ${resendCooldown}s`
                        ) : (
                          "Resend verification email"
                        )}
                      </Button>
                      <a
                        href="/sign-in"
                        className="block text-center text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
                      >
                        Go to sign in
                      </a>
                    </div>
                  )}
                  {accountStatus === "oauth_only" && (
                    <a
                      href="/sign-in"
                      className="block text-center text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Go to sign in
                    </a>
                  )}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((p) => ({ ...p, name: "" }));
                    }}
                    disabled={isLoading}
                    autoFocus
                    required
                  />
                  {errors.name && (
                    <FieldError errors={[{ message: errors.name }]} />
                  )}
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: "" }));
                    }}
                    disabled={isLoading}
                    required
                  />
                  {errors.email && (
                    <FieldError errors={[{ message: errors.email }]} />
                  )}
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((p) => ({ ...p, password: "" }));
                      }}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldError errors={[{ message: errors.password }]} />
                  )}
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
                    disabled={isLoading}
                    required
                  />
                  {errors.confirmPassword && (
                    <FieldError
                      errors={[{ message: errors.confirmPassword }]}
                    />
                  )}
                </FieldContent>
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a href="/sign-in" className="underline underline-offset-4">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}