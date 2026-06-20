import { SignUpForm } from "@/components/auth/sign-up-form";
import { getAvailableProviders } from "@/lib/auth-providers";

export default function SignUpPage() {
  const availableProviders = getAvailableProviders();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm availableProviders={availableProviders} />
      </div>
    </div>
  );
}
