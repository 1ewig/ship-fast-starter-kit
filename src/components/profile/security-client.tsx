"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Mail } from "lucide-react";
import { ChangePasswordCard } from "@/components/profile/change-password-card";

export function SecurityClient() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security</h2>
        <p className="text-muted-foreground">
          Manage your password, email, and two-factor authentication.
        </p>
      </div>

      <ChangePasswordCard />

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
          <p className="text-sm text-muted-foreground">
            Email change coming soon.
          </p>
        </CardContent>
      </Card>

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
          <p className="text-sm text-muted-foreground">
            Two-factor authentication setup coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
