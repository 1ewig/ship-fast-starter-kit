"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface NameFormProps {
  nameForm: {
    name: string;
    setName: (name: string) => void;
    isUpdating: boolean;
    error: string;
    setError: (error: string) => void;
    success: boolean;
    setSuccess: (success: boolean) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    isChanged: boolean;
  };
}

export function NameForm({ nameForm }: NameFormProps) {
  return (
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
            maxLength={100}
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
        <p className="text-xs text-destructive font-medium">
          {nameForm.error}
        </p>
      )}

      {nameForm.success && (
        <p className="text-xs text-green-600 font-medium">
          Display name updated successfully!
        </p>
      )}
    </form>
  );
}
