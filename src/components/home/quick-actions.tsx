import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled>
          Settings
        </Button>
        <Button variant="secondary" disabled>
          Billing
        </Button>
        <Button variant="secondary" disabled>
          API Keys
        </Button>
      </CardContent>
    </Card>
  );
}
