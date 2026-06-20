const SOCIAL_PROVIDERS = {
  github: { clientId: "GITHUB_CLIENT_ID", clientSecret: "GITHUB_CLIENT_SECRET" },
  google: { clientId: "GOOGLE_CLIENT_ID", clientSecret: "GOOGLE_CLIENT_SECRET" },
} as const;

export type SocialProvider = keyof typeof SOCIAL_PROVIDERS;

export function getAvailableProviders(): SocialProvider[] {
  return (
    Object.entries(SOCIAL_PROVIDERS) as [SocialProvider, { clientId: string; clientSecret: string }][]
  )
    .filter(
      ([, env]) => !!process.env[env.clientId] && !!process.env[env.clientSecret]
    )
    .map(([provider]) => provider);
}
