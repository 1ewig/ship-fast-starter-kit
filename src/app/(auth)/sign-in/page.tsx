import { SignInForm } from "@/components/auth/sign-in-form";
import { getAvailableProviders } from "@/lib/auth-providers";

export default function SignInPage() {
  const availableProviders = getAvailableProviders();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignInForm availableProviders={availableProviders} />
      </div>
    </div>
  );
}
