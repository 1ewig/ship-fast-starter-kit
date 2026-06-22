import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { twoFactor, multiSession, admin, bearer } from "better-auth/plugins";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      twoFactor: schema.twoFactor,
      rateLimit: schema.rateLimit,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  // Enable database joins to optimize session lookups (2-3x faster)
  experimental: {
    joins: true,
  },

  // Credentials sign-in settings
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Verification mandatory before sign-in
    autoSignIn: false, // Prevent auto sign-in on registration before verification
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password - SaaS Starter Kit",
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <div style="margin: 20px 0;">
              <a href="${url}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
            <p>If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });
    },
  },

  // Email verification workflow
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email - SaaS Starter Kit",
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>Welcome to SaaS Starter Kit! Please verify your email address by clicking the button below:</p>
            <div style="margin: 20px 0;">
              <a href="${url}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </div>
            <p>Looking forward to having you on board.</p>
          </div>
        `,
      });
    },
  },

  // OAuth Providers config
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      mapProfileToUser: (profile) => {
        if (!profile.email) {
          throw new Error("GitHub did not return a public email address. Please make your primary email public on GitHub or use another sign-in method.");
        }
        return {
          email: profile.email,
          name: profile.name || profile.login,
          image: profile.avatar_url,
          emailVerified: true, // Handled and verified by Better Auth fetching primary verified emails
        };
      },
    },
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        mapProfileToUser: (profile) => {
          if (profile.email_verified !== true) {
            throw new Error("Your Google account email must be verified to sign in.");
          }
          return {
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            emailVerified: true,
          };
        },
      },
    }
  : {}),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? {
          discord: {
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // Account Linking Policies
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github"], // Restrict automatic mapping to highly trusted verified emails
      allowDifferentEmails: false, // Prevent cross-email takeover vulnerabilities
    },
  },

  // persistent database-backed rate limiter
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: "database",
    modelName: "rateLimit",
    customRules: {
      "/sign-in/email": { window: 10, max: 5 },
      "/sign-up/email": { window: 10, max: 3 },
      "/email-verification/send-verification-email": { window: 60, max: 2 },
      "/request-password-reset": { window: 60, max: 2 },
      "/reset-password": { window: 300, max: 5 },
    },
  },

  onAPIError: {
    errorURL: "/error",
  },

  // Security plugins
  plugins: [
    twoFactor({
      issuer: "SaaSStarterKit",
      totpOptions: { digits: 6, period: 30 },
      skipVerificationOnEnable: false,
    }),
    multiSession({
      maximumSessions: 5,
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    bearer(),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          if (ctx && ctx.path && ctx.path.includes("/callback/")) {
            if (!user.emailVerified) {
              throw new Error("Your social account email is not verified. Please verify it in your provider settings before signing up.");
            }
          }
          return { data: user };
        },
      },
    },
  },
});
