// Shared media helpers for the create-post flow: type/size validation and
// client-side image compression. Kept framework-agnostic so the storage
// layer (Supabase today) can be swapped without touching callers.

export type MediaType = "photo" | "video";

export type SelectedMedia = {
  file: File;
  previewUrl: string;
  type: MediaType;
  // "camera" | "record" | "gallery" — where the media came from, for UX copy.
  source: "camera" | "record" | "gallery";
};

export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
export const VIDEO_MIME = ["video/mp4", "video/quicktime", "video/webm"];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB before compression
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

// Longest edge an uploaded/captured photo is resized to before upload.
const MAX_IMAGE_DIMENSION = 1280;
const COMPRESS_QUALITY = 0.82;

export function mediaTypeForFile(file: File): MediaType | null {
  if (IMAGE_MIME.includes(file.type)) return "photo";
  if (VIDEO_MIME.includes(file.type)) return "video";
  return null;
}

function prettyBytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

/** Returns an error message if the file isn't an accepted type/size, else null. */
export function validateMediaFile(file: File): string | null {
  const type = mediaTypeForFile(file);
  if (!type) {
    return "Unsupported file. Use JPG, PNG, WebP, MP4, MOV, or WebM.";
  }
  if (type === "photo" && file.size > MAX_IMAGE_BYTES) {
    return `That photo is too large (max ${prettyBytes(MAX_IMAGE_BYTES)}).`;
  }
  if (type === "video" && file.size > MAX_VIDEO_BYTES) {
    return `That video is too large (max ${prettyBytes(MAX_VIDEO_BYTES)}).`;
  }
  return null;
}

/**
 * Downscale and re-encode a photo to keep uploads small. Falls back to the
 * original file if anything goes wrong or it's already small. Videos pass
 * through untouched (transcoding belongs server-side).
 */
export async function compressImage(file: File): Promise<File> {
  if (!IMAGE_MIME.includes(file.type)) return file;
  if (typeof document === "undefined") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    // Already small enough and reasonably sized — skip re-encoding.
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", COMPRESS_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
      type: "image/webp",
    });
  } catch {
    return file;
  }
}

/** Playful default captions shown as placeholder text. */
export const CAPTION_PLACEHOLDERS = [
  "Did this deserve aura?",
  "Aura gain or aura loss?",
  "Rate this moment.",
];
