import imageCompression from "browser-image-compression";

export interface CompressedImage {
  photo: File; // ~1200px, WebP
  thumb: File; // ~300px, WebP
}

const WEBP = "image/webp";

export async function compressImage(file: File): Promise<CompressedImage> {
  const photo = await imageCompression(file, {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.3,
    initialQuality: 0.7,
    fileType: WEBP,
    useWebWorker: true,
  });

  const thumb = await imageCompression(file, {
    maxWidthOrHeight: 300,
    maxSizeMB: 0.05,
    initialQuality: 0.6,
    fileType: WEBP,
    useWebWorker: true,
  });

  return {
    photo: new File([photo], "photo.webp", { type: WEBP }),
    thumb: new File([thumb], "thumb.webp", { type: WEBP }),
  };
}
