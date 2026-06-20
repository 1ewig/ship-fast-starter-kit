"use server";

import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/dal";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET_NAME = "avatars";
const AVATAR_SIZE = 256;
const WEBP_QUALITY = 80;

export type UploadAvatarResult =
  | { success: true; imageUrl: string }
  | { success: false; error: string; code: string };

function extractFilenameFromUrl(url: string, bucketName: string): string | null {
  try {
    const decodedUrl = decodeURIComponent(url);
    const searchPattern = `/storage/v1/object/public/${bucketName}/`;
    const index = decodedUrl.indexOf(searchPattern);
    if (index !== -1) {
      const filenameWithParams = decodedUrl.substring(index + searchPattern.length);
      return filenameWithParams.split("?")[0];
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

export async function uploadAvatar(
  formData: FormData
): Promise<UploadAvatarResult> {
  let session: Awaited<ReturnType<typeof requireAuth>>;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "You must be signed in to upload an avatar.", code: "UNAUTHORIZED" };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided.", code: "NO_FILE" };
  }

  if (file.size === 0) {
    return { success: false, error: "File is empty.", code: "EMPTY_FILE" };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { success: false, error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.", code: "INVALID_TYPE" };
  }

  if (file.size > MAX_SIZE) {
    return { success: false, error: "File too large. Maximum size is 5MB.", code: "FILE_TOO_LARGE" };
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return { success: false, error: "Failed to read file data.", code: "FILE_READ_ERROR" };
  }

  let processedImage: Buffer;
  try {
    processedImage = await sharp(Buffer.from(buffer))
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return { success: false, error: "Failed to process image.", code: "PROCESSING_ERROR" };
  }

  const supabase = getSupabaseAdmin();

  const { error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
  if (bucketError) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_SIZE,
      allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
    });
  }

  // Delete old avatar file if it exists
  const currentImageUrl = session.user.image;
  if (currentImageUrl) {
    const oldFilename = extractFilenameFromUrl(currentImageUrl, BUCKET_NAME);
    if (oldFilename) {
      await supabase.storage.from(BUCKET_NAME).remove([oldFilename]).catch((err) => {
        console.error("Failed to remove old avatar file from storage:", err);
      });
    }
  }

  const uniqueId = crypto.randomUUID();
  const filePath = `${session.user.id}-${uniqueId}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, processedImage, {
      contentType: "image/webp",
      cacheControl: "31536000, immutable",
    });

  if (uploadError) {
    return { success: false, error: `Upload failed: ${uploadError.message}`, code: "STORAGE_UPLOAD_FAILED" };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  const updateResult = await auth.api.updateUser({
    headers: await headers(),
    body: { image: publicUrl },
  });

  if (!updateResult.status) {
    // Rollback: delete the uploaded file if DB update fails
    await supabase.storage.from(BUCKET_NAME).remove([filePath]).catch((err) => {
      console.error("Rollback: failed to remove uploaded file:", err);
    });
    return { success: false, error: "Failed to update profile picture.", code: "DB_UPDATE_FAILED" };
  }

  revalidatePath("/");

  return { success: true, imageUrl: publicUrl };
}

export async function deleteAvatar(): Promise<UploadAvatarResult> {
  let session: Awaited<ReturnType<typeof requireAuth>>;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "You must be signed in.", code: "UNAUTHORIZED" };
  }

  const currentImageUrl = session.user.image;
  if (!currentImageUrl) {
    return { success: false, error: "No avatar to remove.", code: "NO_AVATAR" };
  }

  const supabase = getSupabaseAdmin();

  const oldFilename = extractFilenameFromUrl(currentImageUrl, BUCKET_NAME);
  if (oldFilename) {
    await supabase.storage.from(BUCKET_NAME).remove([oldFilename]).catch((err) => {
      console.error("Failed to remove avatar from storage:", err);
    });
  }

  const updateResult = await auth.api.updateUser({
    headers: await headers(),
    body: { image: null },
  });

  if (!updateResult.status) {
    return { success: false, error: "Failed to remove avatar from profile.", code: "DB_UPDATE_FAILED" };
  }

  revalidatePath("/");

  return { success: true, imageUrl: "" };
}
