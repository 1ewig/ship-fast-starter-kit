import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyTwoFactorForm } from "@/components/auth/verify-two-factor-form";

export const metadata: Metadata = {
  title: "Two-Factor Authentication | SaaS Starter Kit",
};

export default function VerifyTwoFactorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            A verification code has been sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyTwoFactorForm />
        </CardContent>
      </Card>
    </div>
  );
}
