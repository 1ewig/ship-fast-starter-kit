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
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { PasswordField } from "./PasswordField";
import { VerificationEmailBanner } from "./VerificationEmailBanner";

import { Loader2, MailCheck } from "lucide-react";
import type { SocialProvider } from "@/lib/auth-providers";

export function SignUpForm({
  className,
  availableProviders,
  ...props
}: React.ComponentProps<"div"> & { availableProviders: SocialProvider[] }) {
  const form = useSignUpForm(availableProviders);

  if (form.success) {
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
                    {form.submittedEmail}
                  </span>
                </CardDescription>
              </div>
              <p className="text-sm text-muted-foreground">
                Please verify your email before signing in. Check your spam
                folder if you don&apos;t see it.
              </p>

              <VerificationEmailBanner
                email={form.submittedEmail}
                onResend={form.handleResendVerification}
                isResending={form.isResending}
                cooldown={form.resendCooldown}
                resendSuccess={form.resendSuccess}
                resendError={form.resendError}
              />

              <a
                href="/sign-in"
                className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 text-center pt-1"
              >
                Back to sign in
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
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit} noValidate>
            <FieldGroup>
              {form.generalError && (
                <div className="space-y-2">
                  <FieldError
                    errors={[{ message: form.generalError }]}
                    className="text-center"
                  />
                  {form.accountStatus === "verified" && (
                    <a
                      href="/sign-in"
                      className="block text-center text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Go to sign in
                    </a>
                  )}
                  {form.accountStatus === "unverified" && (
                    <div className="space-y-2">
                      <VerificationEmailBanner
                        email={form.email}
                        onResend={form.handleResendVerification}
                        isResending={form.isResending}
                        cooldown={form.resendCooldown}
                        resendSuccess={form.resendSuccess}
                        resendError={form.resendError}
                      />
                      <a
                        href="/sign-in"
                        className="block text-center text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
                      >
                        Go to sign in
                      </a>
                    </div>
                  )}
                  {form.accountStatus === "oauth_only" && (
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
                    value={form.name}
                    onChange={(e) => {
                      form.setName(e.target.value);
                      form.setErrors((p) => ({ ...p, name: "" }));
                    }}
                    disabled={form.isLoading}
                    autoFocus
                    required
                    maxLength={100}
                  />
                  {form.errors.name && (
                    <FieldError errors={[{ message: form.errors.name }]} />
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
                    value={form.email}
                    onChange={(e) => {
                      form.setEmail(e.target.value);
                      form.setErrors((p) => ({ ...p, email: "" }));
                    }}
                    disabled={form.isLoading}
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
                onToggleShow={() => form.setShowPassword(!form.showPassword)}
                placeholder="Repeat your password"
              />

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.isLoading || form.socialLoading !== ""}
                >
                  {form.isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <SocialLoginButtons
                  isLoading={form.isLoading}
                  socialLoading={form.socialLoading}
                  onSocialLogin={form.handleSocialLogin}
                  providers={availableProviders}
                />

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
