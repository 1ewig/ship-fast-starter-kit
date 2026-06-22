"use client";

import { useState } from "react";
import { useTwoFactorSetup } from "@/hooks/useTwoFactorSetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface TwoFactorCardProps {
  isEnabled: boolean;
}

export function TwoFactorCard({ isEnabled }: TwoFactorCardProps) {
  const { step, setStep, isLoading, error, handleEnable, handleDisable } = useTwoFactorSetup(isEnabled);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    if (step === "enabling") {
      const ok = await handleEnable(password);
      if (ok) setPassword("");
    } else if (step === "disabling") {
      const ok = await handleDisable(password);
      if (ok) setPassword("");
    }
  };

  if (step === "enabling" || step === "disabling") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Shield className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                {step === "enabling"
                  ? "Confirm your password to enable two-factor authentication."
                  : "Confirm your password to disable two-factor authentication."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                )}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStep("idle"); setPassword(""); setShowPassword(false); }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !password}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {step === "enabling" ? "Enabling..." : "Disabling..."}
                  </>
                ) : (
                  step === "enabling" ? "Enable" : "Disable"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (isEnabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Your account is protected with two-factor authentication.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            During sign-in, a one-time code will be sent to your email.
          </p>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setStep("disabling")}>
              Disable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-muted">
            <Shield className="size-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Add an extra layer of security to your account.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          A one-time code will be sent to your email during sign-in.
        </p>
        <div className="flex justify-end">
          <Button onClick={() => setStep("enabling")}>
            Enable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
