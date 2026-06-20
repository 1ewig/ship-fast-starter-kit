"use server";

import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import sharp from "sharp";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET_NAME = "avatars";
const AVATAR_SIZE = 256;
const WEBP_QUALITY = 80;

export async function uploadAvatar(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("You must be signed in to upload an avatar.");
  }

  const file = formData.get("avatar") as File | null;
  if (!file) {
    throw new Error("No file provided.");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const processedImage = await sharp(buffer)
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const supabase = getSupabaseAdmin();

  const { error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
  if (bucketError) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_SIZE,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    });
  }

  // Attempt to delete the old avatar file from Supabase Storage if it exists
  if (session.user.image) {
    const oldFilename = extractFilenameFromUrl(session.user.image, BUCKET_NAME);
    if (oldFilename) {
      await supabase.storage.from(BUCKET_NAME).remove([oldFilename]).catch((err) => {
        console.error("Failed to remove old avatar file from storage:", err);
      });
    }
  }

  // Generate a unique, cache-busting filename
  const uniqueId = crypto.randomUUID();
  const filePath = `${session.user.id}-${uniqueId}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, processedImage, {
      contentType: "image/webp",
      cacheControl: "31536000, immutable",
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
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
    throw new Error("Failed to update profile picture.");
  }

  return { url: publicUrl };
}

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
