"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Camera, Trash2, PencilLine, X, Check } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { authClient } from "@/lib/auth-client";
import { CropModal } from "@/components/ui/crop-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AvatarUploadProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AvatarUpload({ user }: AvatarUploadProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const avatar = useAvatarUpload();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(user.name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");

  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditingName) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (editContainerRef.current && !editContainerRef.current.contains(e.target as Node)) {
        handleCancelEdit();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditingName]);

  const handleStartEdit = () => {
    setEditingName(user.name || "");
    setNameError("");
    setNameSuccess("");
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setEditingName(user.name || "");
    setNameError("");
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setNameError("Name cannot be empty");
      return;
    }

    if (trimmed === (user.name || "").trim()) {
      setIsEditingName(false);
      return;
    }

    setNameError("");
    setNameSuccess("");
    setIsUpdatingName(true);

    const { error } = await authClient.updateUser({ name: trimmed });

    setIsUpdatingName(false);

    if (error) {
      setNameError(error.message || "Failed to update name");
      return;
    }

    setNameSuccess("Display name updated");
    setIsEditingName(false);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={avatar.triggerFileInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              avatar.triggerFileInput();
            }
          }}
          className="group relative size-16 shrink-0 cursor-pointer rounded-full border overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          disabled={avatar.isUploading}
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "Avatar"}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted text-base font-semibold">
              {getInitials(user.name)}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            {avatar.isUploading ? (
              <Loader2 className="size-5 text-white animate-spin" />
            ) : (
              <Camera className="size-5 text-white" />
            )}
          </div>
        </button>

        <div className="flex-1 space-y-1">
          {isEditingName ? (
            <div ref={editContainerRef} className="flex items-center gap-2">
              <Input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                maxLength={100}
                className="h-8 text-sm"
                disabled={isUpdatingName}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={isUpdatingName}
                className="shrink-0 p-1 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
              >
                {isUpdatingName ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isUpdatingName}
                className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium">{user.name || "No name set"}</p>
              <button
                type="button"
                onClick={handleStartEdit}
                className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PencilLine className="size-3.5" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {user.image && (
          <Button
            variant="ghost"
            size="sm"
            disabled={avatar.isUploading || avatar.isDeleting}
            onClick={() => setDeleteConfirmOpen(true)}
            className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {avatar.isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        )}
      </div>

      {nameError && (
        <p className="text-xs text-destructive font-medium mt-2">{nameError}</p>
      )}

      {nameSuccess && (
        <p className="text-xs text-green-600 font-medium mt-2">{nameSuccess}</p>
      )}

      {avatar.error && (
        <p className="text-xs text-destructive font-medium mt-2">{avatar.error}</p>
      )}
      {avatar.success && (
        <p className="text-xs text-green-600 font-medium mt-2">
          Avatar updated successfully!
        </p>
      )}

      <input
        ref={avatar.fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={avatar.handleFileChange}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove avatar?</DialogTitle>
            <DialogDescription>
              Your avatar will be removed and replaced with your initials.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={avatar.isDeleting}
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={avatar.isDeleting}
              onClick={async () => {
                await avatar.remove();
                setDeleteConfirmOpen(false);
              }}
            >
              {avatar.isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {avatar.imageSrc && (
        <CropModal
          open={!!avatar.imageSrc}
          onClose={avatar.closeCropModal}
          imageSrc={avatar.imageSrc}
          onSave={avatar.handleCropComplete}
        />
      )}
    </>
  );
}
