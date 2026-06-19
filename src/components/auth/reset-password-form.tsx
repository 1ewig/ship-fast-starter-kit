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
} from "@/components/ui/field";
import { useResetPasswordForm } from "@/hooks/useResetPasswordForm";
import { PasswordField } from "./PasswordField";

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useResetPasswordForm();

  if (!form.token) {
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

  if (form.success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  Password reset successful
                </CardTitle>
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
          <form onSubmit={form.handleSubmit} noValidate>
            <FieldGroup>
              {form.generalError && (
                <FieldError
                  errors={[{ message: form.generalError }]}
                  className="text-center"
                />
              )}

              <PasswordField
                id="newPassword"
                label="New Password"
                value={form.newPassword}
                onChange={(v) => {
                  form.setNewPassword(v);
                  form.setErrors((p) => ({ ...p, newPassword: "" }));
                }}
                error={form.errors.newPassword}
                disabled={form.isLoading}
                showPassword={form.showPassword}
                onToggleShow={() =>
                  form.setShowPassword(!form.showPassword)
                }
                autoFocus
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                value={form.confirmPassword}
                onChange={(v) => {
                  form.setConfirmPassword(v);
                  form.setErrors((p) => ({ ...p, confirmPassword: "" }));
                }}
                error={form.errors.confirmPassword}
                disabled={form.isLoading}
                showPassword={form.showPassword}
                onToggleShow={() =>
                  form.setShowPassword(!form.showPassword)
                }
                placeholder="Repeat your password"
              />

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.isLoading}
                >
                  {form.isLoading ? (
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
