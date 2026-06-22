"use client";

import { useChangeEmailForm } from "@/hooks/useChangeEmailForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export function ChangeEmailCard() {
  const {
    stage,
    newEmail,
    setNewEmail,
    currentPassword,
    setCurrentPassword,
    otp,
    setOtp,
    isLoading,
    error,
    resendCooldown,
    handleEmailSubmit,
    handlePasswordSubmit,
    handleOtpSubmit,
    handleReset,
    handleBackToEmail,
  } = useChangeEmailForm();

  if (stage === "done") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
              <CheckCircle2 className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>Your email has been updated.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleReset}>
            Change email again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (stage === "otp") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Mail className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to <span className="font-medium">{newEmail}</span>.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                className="text-center text-lg tracking-[8px]"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Email"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (stage === "password") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Mail className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>
                Confirm your password to change to <span className="font-medium">{newEmail}</span>.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToEmail}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Change email address
              </button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Confirm Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-muted">
            <Mail className="size-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>Update the email address associated with your account.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              maxLength={254}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}
