"use client";

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
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useUpdateNameForm } from "@/hooks/useUpdateNameForm";
import { Mail, Calendar, Loader2 } from "lucide-react";

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
  isLoadingAccounts?: boolean;
  onUnlink: (providerId: string) => Promise<void>;
  onLinkSocial: (provider: "github" | "google") => Promise<void>;
  isLinking: string | null;
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const providerConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  github: { label: "GitHub", icon: GithubIcon },
  google: { label: "Google", icon: GoogleIcon },
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

export function ProfileCard({
  session,
  accounts,
  isLoadingAccounts = false,
  onUnlink,
  onLinkSocial,
  isLinking,
}: ProfileCardProps) {
  const nameForm = useUpdateNameForm(session.user.name || "");
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const [unlinkError, setUnlinkError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

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

  const canDisconnect = accounts.length > 1;
  const hasSocialConnected = accounts.some((a) => a.providerId === "github" || a.providerId === "google");
  const socialProvidersList = ["github", "google"] as const;

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
 
        {/* Name Update Section */}
        <div className="pt-4 border-t border-border/40 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider">
              DISPLAY NAME
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Change your display name visible across the application.
            </p>
          </div>
          
          <form onSubmit={nameForm.handleSubmit} className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  id="display-name"
                  type="text"
                  placeholder="Enter display name"
                  value={nameForm.name}
                  onChange={(e) => {
                    nameForm.setName(e.target.value);
                    nameForm.setError("");
                  }}
                  disabled={nameForm.isUpdating}
                  className="h-9"
                  required
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={!nameForm.isChanged || nameForm.isUpdating}
                className="h-9 px-4 shrink-0 transition-all cursor-pointer"
              >
                {nameForm.isUpdating ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>

            {nameForm.error && (
              <p className="text-xs text-destructive font-medium flex items-center gap-1">
                <span>⚠️</span> {nameForm.error}
              </p>
            )}

            {nameForm.success && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1 animate-fade-in">
                <span>✓</span> Display name updated successfully!
              </p>
            )}
          </form>
        </div>

        {/* Socials Section */}
        <div className="pt-4 border-t border-border/40 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider">
              SOCIALS
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect or disconnect your social sign-in methods.
            </p>
          </div>

          <div className="space-y-2.5">
            {socialProvidersList.map((p) => {
              const config = providerConfig[p];
              if (!config) return null;
              const Icon = config.icon;
              const linkedAccount = accounts.find((a) => a.providerId === p);
              const isLinked = !!linkedAccount;

              return (
                <div
                  key={p}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md border bg-muted/30">
                      <Icon className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      {isLoadingAccounts ? (
                        <div className="h-3 w-16 bg-muted animate-pulse rounded mt-1.5" />
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {isLinked ? "Connected" : "Not connected"}
                        </p>
                      )}
                    </div>
                  </div>

                  {isLoadingAccounts ? (
                    <div className="h-8 w-20 bg-muted/70 animate-pulse rounded" />
                  ) : isLinked ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isUnlinking}
                      onClick={() => {
                        setUnlinkingProvider(p);
                        setOpenDialog(true);
                      }}
                      title={`Disconnect ${config.label}`}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLinking !== null}
                      onClick={() => onLinkSocial(p)}
                    >
                      {isLinking === p ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>


        </div>

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

      <Dialog open={openDialog} onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) {
          setUnlinkingProvider(null);
          setUnlinkError("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {canDisconnect ? (
                `Unlink ${unlinkingProvider ? providerConfig[unlinkingProvider]?.label : ""}?`
              ) : (
                `Cannot Unlink ${unlinkingProvider ? providerConfig[unlinkingProvider]?.label : ""}`
              )}
            </DialogTitle>
            <DialogDescription>
              {canDisconnect ? (
                `You will not be able to log in using ${
                  unlinkingProvider ? providerConfig[unlinkingProvider]?.label : ""
                } anymore. Make sure you have configured another login connection.`
              ) : (
                `Action Blocked: This connection is currently your only login method.`
              )}
            </DialogDescription>
          </DialogHeader>

          {!canDisconnect && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-start gap-2.5 font-medium leading-relaxed my-2">
              <span className="text-sm mt-0.5 shrink-0">⚠️</span>
              <div>
                <p className="font-semibold text-destructive/90">Action Blocked</p>
                <p className="text-destructive/80 mt-0.5">
                  Disconnecting this method would leave your account with no login methods, permanently locking you out. Please configure another connection (like Email & Password or another social account) before disconnecting this one.
                </p>
              </div>
            </div>
          )}

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
              {canDisconnect ? "Cancel" : "Close"}
            </Button>
            {canDisconnect && (
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={isUnlinking}
              >
                {isUnlinking && <Loader2 className="mr-2 size-4 animate-spin" />}
                Unlink Connection
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

