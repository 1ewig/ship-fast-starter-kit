import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, Calendar } from "lucide-react";

interface ProfileCardProps {
  session: {
    user: {
      name?: string | null;
      email: string;
      createdAt: Date | string;
    };
  };
}

export function ProfileCard({ session }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="size-4 text-muted-foreground" />
          <span>{session.user.name || "No name set"}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="size-4 text-muted-foreground" />
          <span>{session.user.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="size-4 text-muted-foreground" />
          <span>
            Joined {new Date(session.user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
