"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Camera, Trash2 } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { CropModal } from "@/components/ui/crop-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

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

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={avatar.triggerFileInput}
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

        <div className="space-y-1">
          <p className="font-medium">{user.name || "No name set"}</p>
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

      {avatar.error && (
        <p className="text-xs text-destructive font-medium">{avatar.error}</p>
      )}
      {avatar.success && (
        <p className="text-xs text-green-600 font-medium">
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
