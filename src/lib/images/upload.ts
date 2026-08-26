import { compressImage } from "./compress";

interface PresignedFile {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  variant: "photo" | "thumb";
}

export interface UploadedImages {
  photoUrls: string[];
  thumbnailUrls: string[];
}

async function putToR2(url: string, file: File) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}

/**
 * Compress each source image into a photo + thumbnail, request presigned URLs,
 * and upload directly to R2. Returns the public URLs, index-aligned per source.
 */
export async function uploadReportImages(
  files: File[],
): Promise<UploadedImages> {
  if (files.length === 0) return { photoUrls: [], thumbnailUrls: [] };

  const compressed = await Promise.all(files.map(compressImage));

  const manifest = compressed.flatMap(() => [
    { contentType: "image/webp", variant: "photo" as const },
    { contentType: "image/webp", variant: "thumb" as const },
  ]);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: manifest }),
  });
  if (!res.ok) throw new Error("Could not get upload URLs");

  const { files: signed } = (await res.json()) as { files: PresignedFile[] };

  const photoUrls: string[] = [];
  const thumbnailUrls: string[] = [];

  await Promise.all(
    compressed.map(async ({ photo, thumb }, i) => {
      const photoSlot = signed[i * 2];
      const thumbSlot = signed[i * 2 + 1];
      await Promise.all([
        putToR2(photoSlot.uploadUrl, photo),
        putToR2(thumbSlot.uploadUrl, thumb),
      ]);
      photoUrls[i] = photoSlot.publicUrl;
      thumbnailUrls[i] = thumbSlot.publicUrl;
    }),
  );

  return { photoUrls, thumbnailUrls };
}
