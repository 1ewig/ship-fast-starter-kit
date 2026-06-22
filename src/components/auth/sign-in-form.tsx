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
import { useSignInForm } from "@/hooks/useSignInForm";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { PasswordField } from "./PasswordField";
import { VerificationEmailBanner } from "./VerificationEmailBanner";

import { Loader2 } from "lucide-react";
import type { SocialProvider } from "@/lib/auth-providers";

export function SignInForm({
  className,
  availableProviders,
  ...props
}: React.ComponentProps<"div"> & { availableProviders: SocialProvider[] }) {
  const form = useSignInForm(availableProviders);

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
          <form onSubmit={form.handleSubmit}>
            <FieldGroup>
              {form.generalError && (
                <FieldError
                  errors={[{ message: form.generalError }]}
                  className="text-center"
                />
              )}

              {form.resendSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-600 text-center font-medium">
                  {form.resendSuccess}
                </div>
              )}

              {form.isEmailUnverified && (
                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground flex flex-col items-center gap-1.5 text-center">
                  <span>Your email address is not verified yet.</span>
                  <button
                    type="button"
                    onClick={form.handleResendVerification}
                    disabled={form.resendCooldown > 0 || form.isResending}
                    className="text-primary font-semibold underline disabled:no-underline disabled:opacity-50 hover:text-primary/95 transition-all cursor-pointer"
                  >
                    {form.isResending ? (
                      "Sending..."
                    ) : form.resendCooldown > 0 ? (
                      `Resend in ${form.resendCooldown}s`
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
                    value={form.email}
                    onChange={(e) => {
                      form.setEmail(e.target.value);
                      form.setErrors((p) => ({ ...p, email: "" }));
                    }}
                    disabled={form.isLoading}
                    autoFocus
                    required
                    maxLength={254}
                  />
                  {form.errors.email && (
                    <FieldError errors={[{ message: form.errors.email }]} />
                  )}
                </FieldContent>
              </Field>

              <PasswordField
                id="password"
                label="Password"
                value={form.password}
                onChange={(v) => {
                  form.setPassword(v);
                  form.setErrors((p) => ({ ...p, password: "" }));
                }}
                error={form.errors.password}
                disabled={form.isLoading}
                showPassword={form.showPassword}
                onToggleShow={() => form.setShowPassword(!form.showPassword)}
              >
                <a
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </PasswordField>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.isLoading || form.socialLoading !== ""}
                >
                  {form.isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <SocialLoginButtons
                  isLoading={form.isLoading}
                  socialLoading={form.socialLoading}
                  onSocialLogin={form.handleSocialLogin}
                  providers={availableProviders}
                />

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
