"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { uploadAvatar, deleteAvatar } from "@/lib/actions/upload-avatar";

export function useAvatarUpload() {
  const router = useRouter();
  const { refetch } = useSession();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastObjectUrl = useRef<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const refreshSession = useCallback(async () => {
    try {
      await refetch();
      router.refresh();
    } catch (e) {
      console.warn("[Avatar] Session refresh failed:", e);
      router.refresh();
    }
  }, [refetch, router]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError("");
      setSuccess(false);

      if (!acceptedTypes.includes(file.type)) {
        setError("Please upload a JPEG, PNG, WebP, or GIF image.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      if (lastObjectUrl.current) {
        URL.revokeObjectURL(lastObjectUrl.current);
      }

      const url = URL.createObjectURL(file);
      lastObjectUrl.current = url;
      setImageSrc(url);

      e.target.value = "";
    },
    []
  );

  const closeCropModal = useCallback(() => {
    if (lastObjectUrl.current) {
      URL.revokeObjectURL(lastObjectUrl.current);
      lastObjectUrl.current = null;
    }
    setImageSrc(null);
    setError("");
  }, []);

  const handleCropComplete = useCallback(async (blob: Blob) => {
    setIsUploading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      const file = new File([blob], "avatar.webp", { type: "image/webp" });
      formData.append("avatar", file);

      const result = await uploadAvatar(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);

      if (lastObjectUrl.current) {
        URL.revokeObjectURL(lastObjectUrl.current);
        lastObjectUrl.current = null;
      }
      setImageSrc(null);

      await refreshSession();

      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(false), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload avatar. Please try again.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }, [refreshSession]);

  const remove = useCallback(async () => {
    setIsDeleting(true);
    setError("");
    setSuccess(false);

    try {
      const result = await deleteAvatar();

      if (!result.success) {
        setError(result.error);
        return;
      }

      await refreshSession();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove avatar.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [refreshSession]);

  return {
    imageSrc,
    isUploading,
    isDeleting,
    error,
    success,
    fileInputRef,
    triggerFileInput,
    handleFileChange,
    closeCropModal,
    handleCropComplete,
    remove,
  };
}
