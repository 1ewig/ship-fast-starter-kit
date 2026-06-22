import { createAuthClient } from "better-auth/react";
import { twoFactorClient, multiSessionClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/verify-2fa";
      },
    }),
    multiSessionClient(),
    adminClient(),
  ],
});

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  listAccounts,
  unlinkAccount,
  requestPasswordReset,
  resetPassword,
  linkSocial,
  sendVerificationEmail,
} = authClient;
