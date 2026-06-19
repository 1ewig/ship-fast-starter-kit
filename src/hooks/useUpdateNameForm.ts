"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function useUpdateNameForm(initialName: string) {
  const [name, setName] = useState(initialName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Keep state in sync if initialName changes (e.g. on session updates)
  useEffect(() => {
    setName(initialName || "");
  }, [initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      const { error: updateError } = await authClient.updateUser({
        name: trimmedName,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update name");
      } else {
        setSuccess(true);
        // Automatically dismiss success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const isChanged = name.trim() !== (initialName || "").trim();

  return {
    name,
    setName,
    isUpdating,
    error,
    setError,
    success,
    setSuccess,
    handleSubmit,
    isChanged,
  };
}
