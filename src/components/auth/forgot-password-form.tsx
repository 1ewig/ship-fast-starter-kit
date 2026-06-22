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
import { useForgotPasswordForm } from "@/hooks/useForgotPasswordForm";

import { Loader2, MailCheck } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForgotPasswordForm();

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
                  If an account exists with{" "}
                  <span className="font-medium text-foreground">
                    {form.email}
                  </span>
                  , you&apos;ll receive a reset link shortly.
                </CardDescription>
              </div>
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try
                again.
              </p>
              <div className="flex flex-col gap-2 w-full pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={form.handleTryAnother}
                >
                  Try another email
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
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit}>
            <FieldGroup>
              {form.error && (
                <FieldError
                  errors={[{ message: form.error }]}
                  className="text-center"
                />
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
                    }}
                    disabled={form.isLoading}
                    autoFocus
                    required
                    maxLength={254}
                  />
                </FieldContent>
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.isLoading}
                >
                  {form.isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>

                <a
                  href="/sign-in"
                  className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 text-center block pt-1"
                >
                  Back to sign in
                </a>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
