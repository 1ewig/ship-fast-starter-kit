"use client";

import { useState, useRef, useCallback } from "react";
import { uploadAvatar } from "@/lib/actions/upload-avatar";

export function useAvatarUpload() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastObjectUrl = useRef<string | null>(null);

  const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
      const file = new File([blob], "avatar.webp", { type: "image/jpeg" });
      formData.append("avatar", file);

      await uploadAvatar(formData);
      setSuccess(true);

      if (lastObjectUrl.current) {
        URL.revokeObjectURL(lastObjectUrl.current);
        lastObjectUrl.current = null;
      }
      setImageSrc(null);

      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    imageSrc,
    isUploading,
    error,
    success,
    fileInputRef,
    triggerFileInput,
    handleFileChange,
    closeCropModal,
    handleCropComplete,
  };
}
