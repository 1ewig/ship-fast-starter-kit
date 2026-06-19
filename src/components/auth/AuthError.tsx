import { FieldError } from "@/components/ui/field";

interface AuthErrorProps {
  message: string;
  className?: string;
}

export function AuthError({ message, className }: AuthErrorProps) {
  return (
    <FieldError
      errors={[{ message }]}
      className={className}
    />
  );
}
