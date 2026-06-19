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
import { signIn, authClient } from "@/lib/auth-client";

import { Loader2, Eye, EyeOff } from "lucide-react";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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

  // Load cooldown state on mount
  useEffect(() => {
    const storedCooldown = localStorage.getItem("verification_resend_cooldown");
    if (storedCooldown) {
      const timeRemaining = Math.ceil((parseInt(storedCooldown, 10) - Date.now()) / 1000);
      if (timeRemaining > 0) {
        setResendCooldown(timeRemaining);
      } else {
        localStorage.removeItem("verification_resend_cooldown");
      }
    }
  }, []);

  // Cooldown countdown timer
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
      const message =
        error.status === 401
          ? "Invalid email or password"
          : error.message || "Something went wrong. Please try again.";
      setGeneralError(message);

      // Detect unverified email errors to prompt user with a resend button
      const isUnverified = error.message?.toLowerCase().includes("verify") || error.message?.toLowerCase().includes("verification");
      if (isUnverified) {
        setIsEmailUnverified(true);
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
      const message = error.status === 429
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

  const handleSocialLogin = async (provider: "github") => {
    setSocialLoading(provider);
    setGeneralError("");
    setResendSuccess("");
    setIsEmailUnverified(false);
    await signIn.social({ provider });
    setSocialLoading("");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {generalError && (
                <FieldError
                  errors={[{ message: generalError }]}
                  className="text-center"
                />
              )}

              {resendSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-600 text-center font-medium">
                  {resendSuccess}
                </div>
              )}

              {isEmailUnverified && (
                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground flex flex-col items-center gap-1.5 text-center">
                  <span>Your email address is not verified yet.</span>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendCooldown > 0 || isResending}
                    className="text-primary font-semibold underline disabled:no-underline disabled:opacity-50 hover:text-primary/95 transition-all cursor-pointer"
                  >
                    {isResending ? (
                      "Sending..."
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend verification email"
                    )}
                  </button>
                </div>
              )}

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
                    autoFocus
                    required
                  />
                  {errors.email && <FieldError errors={[{ message: errors.email }]} />}
                </FieldContent>
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
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
                <Button type="submit" className="w-full" disabled={isLoading || socialLoading === "github"}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={isLoading || socialLoading === "github"}
                  onClick={() => handleSocialLogin("github")}
                >
                  {socialLoading === "github" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <svg role="img" viewBox="0 0 24 24" className="size-4">
                      <path
                        fill="currentColor"
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      />
                    </svg>
                  )}
                  GitHub
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a href="/sign-up" className="underline underline-offset-4">
                    Sign up
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
