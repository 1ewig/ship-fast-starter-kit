import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

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
  onUnlink: (providerId: string) => Promise<void>;
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

const providerConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
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

export function ProfileCard({ session, accounts, onUnlink }: ProfileCardProps) {
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const [unlinkError, setUnlinkError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null);

  const sortedAccounts = accounts
    .filter((a) => providerConfig[a.providerId])
    .sort((a, b) => (a.providerId === "credential" ? 1 : -1));

  const hasGithub = accounts.some((a) => a.providerId === "github");

  const handleConfirm = async () => {
    if (!unlinkingProvider) return;
    setIsUnlinking(true);
    setUnlinkError("");
    try {
      await onUnlink(unlinkingProvider);
      setOpenDialog(false);
      setUnlinkingProvider(null);
    } catch (err: any) {
      setUnlinkError(err.message || "Failed to unlink connection. Please try again.");
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleLinkSocial = async (provider: "github") => {
    setIsLinking(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (err: any) {
      console.error(`Failed to link ${provider} account:`, err);
    } finally {
      setIsLinking(null);
    }
  };

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
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>

        {sortedAccounts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 tracking-wider">
              LINKED ACCOUNTS
            </p>
            <div className="flex flex-wrap gap-2">
              {sortedAccounts.map((account) => {
                const config = providerConfig[account.providerId];
                if (!config) return null;
                const Icon = config.icon;
                const isOnlyOne = sortedAccounts.length === 1;
                return (
                  <span
                    key={account.id}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground transition-all"
                  >
                    <Icon className="size-3.5 text-muted-foreground" />
                    {config.label}
                    <button
                      type="button"
                      disabled={isOnlyOne}
                      title={
                        isOnlyOne
                          ? "Keep at least one sign-in connection"
                          : `Disconnect ${config.label}`
                      }
                      className="-mr-0.5 ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-30 transition-colors"
                      onClick={() => {
                        setUnlinkingProvider(account.providerId);
                        setOpenDialog(true);
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action to connect new providers if missing */}
        {!hasGithub && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-xs font-medium text-slate-500 tracking-wider mb-2">
              CONNECT NEW PROVIDER
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs h-9 hover:bg-accent"
              onClick={() => handleLinkSocial("github")}
              disabled={isLinking === "github"}
            >
              {isLinking === "github" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <GithubIcon className="size-3.5 text-muted-foreground" />
              )}
              Link GitHub Account
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground pt-1">
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

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Unlink{" "}
              {unlinkingProvider ? providerConfig[unlinkingProvider]?.label : ""}?
            </DialogTitle>
            <DialogDescription>
              You will not be able to log in using{" "}
              {unlinkingProvider ? providerConfig[unlinkingProvider]?.label : ""} anymore. Make sure you have configured another login connection.
            </DialogDescription>
          </DialogHeader>
          {unlinkError && <p className="text-sm text-destructive">{unlinkError}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isUnlinking}
              onClick={() => {
                setOpenDialog(false);
                setUnlinkingProvider(null);
                setUnlinkError("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isUnlinking}
            >
              {isUnlinking && <Loader2 className="mr-2 size-4 animate-spin" />}
              Unlink Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
