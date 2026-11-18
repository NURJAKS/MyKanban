import { TaskImage } from '../types';

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;

/**
 * Compresses and optionally downscales an image File/Blob into a compact data URL
 * so attachments stay fast in localStorage and GitHub Gist sync.
 */
export async function compressImageFile(file: File): Promise<TaskImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Invalid image file'));
    el.src = dataUrl;
  });

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name || 'image.png',
      dataUrl,
      addedAt: new Date().toISOString(),
    };
  }

  ctx.drawImage(img, 0, 0, width, height);

  // Use WebP when supported for best compression, otherwise JPEG (preserving PNG only for small PNGs)
  let compressed = canvas.toDataURL('image/webp', JPEG_QUALITY);
  if (!compressed.startsWith('data:image/webp')) {
    compressed = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  // If original file was already smaller (e.g., tiny crisp PNG/SVG), keep original
  const finalUrl = compressed.length < dataUrl.length ? compressed : dataUrl;

  return {
    id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: file.name || `image-${Date.now()}.webp`,
    dataUrl: finalUrl,
    addedAt: new Date().toISOString(),
  };
}
