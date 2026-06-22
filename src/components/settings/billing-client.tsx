"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Receipt, AlertCircle } from "lucide-react";

export function BillingClient() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <CreditCard className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Add or update your payment method.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Payment method management coming soon.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Receipt className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>View and manage your current plan.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Subscription management coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
