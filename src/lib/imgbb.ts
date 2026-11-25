/**
 * Image hosting on imgbb (https://api.imgbb.com/) — uploaded postcard and rental photos live
 * there, not on our server. The imgbb API has no album parameter, so uploads land in the
 * account's main stream (album NxdgDV is organised by hand on ibb.co).
 *
 * VITE_IMGBB_API_KEY is visible in the browser bundle; move uploads behind a Cloud Function to
 * keep it private.
 */
import { isImgbbImageUrl } from '../types/contracts';

export const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export const isImageUploadConfigured = Boolean(import.meta.env.VITE_IMGBB_API_KEY);

/** imgbb file name from free text, e.g. "Angkor Star Visa — 1-Year EB" → "angkor-star-visa-1-year-eb". */
export function uploadSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'postcard'
  );
}

export interface UploadedImage {
  /** Direct https://i.ibb.co/… link, stored on the postcard. */
  url: string;
  deleteUrl?: string;
  width: number;
  height: number;
}

export async function uploadToImgbb(image: Blob, name: string, signal?: AbortSignal): Promise<UploadedImage> {
  const key = import.meta.env.VITE_IMGBB_API_KEY;
  if (!key) throw new Error('Image uploads aren’t set up yet (VITE_IMGBB_API_KEY).');

  const form = new FormData();
  form.append('image', image, `${name}.jpg`);
  form.append('name', name);

  const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    body: form,
    signal,
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: { url?: string; delete_url?: string; width?: string | number; height?: string | number };
    error?: { message?: string };
  } | null;

  const url = body?.data?.url;
  if (!response.ok || !body?.success || !url || !isImgbbImageUrl(url)) {
    throw new Error(body?.error?.message ? `Upload failed: ${body.error.message}` : 'Upload failed — please try again.');
  }
  return {
    url,
    deleteUrl: body.data?.delete_url,
    width: Number(body.data?.width) || 0,
    height: Number(body.data?.height) || 0,
  };
}
