import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Calendar } from "lucide-react";

interface AccountInfo {
  id: string;
  providerId: string;
  accountId: string;
}

interface ProfileCardProps {
  session: {
    user: {
      name?: string | null;
      email: string;
      image?: string | null;
      createdAt: Date | string;
    };
  };
  accounts: AccountInfo[];
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  );
}

const providerConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  github: { label: "GitHub", icon: GithubIcon },
  credential: { label: "Email & Password", icon: Mail },
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileCard({ session, accounts }: ProfileCardProps) {
  const sortedAccounts = accounts
    .filter((a) => providerConfig[a.providerId])
    .sort((a, b) => (a.providerId === "credential" ? 1 : -1));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "Avatar"}
              className="size-14 rounded-full border object-cover"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
              {getInitials(session.user.name)}
            </div>
          )}
          <div>
            <p className="font-medium">{session.user.name || "No name set"}</p>
            <p className="text-sm text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </div>

        {sortedAccounts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              LINKED ACCOUNTS
            </p>
            <div className="flex flex-wrap gap-2">
              {sortedAccounts.map((account) => {
                const config = providerConfig[account.providerId];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <span
                    key={account.id}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                  >
                    <Icon className="size-3.5" />
                    {config.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Calendar className="size-4 shrink-0" />
          <span>
            Joined{" "}
            {new Date(session.user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
