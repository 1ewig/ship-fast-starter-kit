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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";

import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">Invalid reset link</CardTitle>
                <CardDescription>
                  This password reset link is invalid or has expired.
                </CardDescription>
              </div>
              <a
                href="/forgot-password"
                className="inline-block text-sm underline underline-offset-4 hover:text-primary"
              >
                Request a new reset link
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      token,
    });

    setIsLoading(false);

    if (error) {
      const msg = error.message?.toLowerCase() || "";

      if (error.status === 429) {
        setGeneralError("Too many requests. Please wait a moment before trying again.");
      } else if (msg.includes("invalid") || msg.includes("expired") || msg.includes("token")) {
        setGeneralError(
          "This reset link is invalid or has expired."
        );
      } else if (msg.includes("short") || msg.includes("length")) {
        setErrors((p) => ({
          ...p,
          newPassword: error.message || "Password is too short",
        }));
      } else {
        setGeneralError(error.message || "Something went wrong. Please try again.");
      }
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">Password reset successful</CardTitle>
                <CardDescription>
                  Your password has been updated. You can now sign in with your
                  new password.
                </CardDescription>
              </div>
              <a href="/sign-in">
                <Button className="w-full">Sign in</Button>
              </a>
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
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              {generalError && (
                <FieldError
                  errors={[{ message: generalError }]}
                  className="text-center"
                />
              )}

              <Field>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors((p) => ({ ...p, newPassword: "" }));
                      }}
                      disabled={isLoading}
                      autoFocus
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
                  {errors.newPassword && (
                    <FieldError errors={[{ message: errors.newPassword }]} />
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
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
