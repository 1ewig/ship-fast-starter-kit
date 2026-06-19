"use client";

import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  showPassword: boolean;
  onToggleShow: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  required?: boolean;
  autoComplete?: string;
  children?: React.ReactNode;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  showPassword,
  onToggleShow,
  placeholder = "At least 8 characters",
  autoFocus,
  required = true,
  autoComplete,
  children,
}: PasswordFieldProps) {
  return (
    <Field>
      <div className="flex items-center">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {children}
      </div>
      <FieldContent>
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            autoFocus={autoFocus}
            required={required}
            autoComplete={autoComplete}
          />
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <FieldError errors={[{ message: error }]} />}
      </FieldContent>
    </Field>
  );
}
