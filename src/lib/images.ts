/** All postcard images are 16:9. */
export const POSTCARD_ASPECT = 16 / 9;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // imgbb allows 32 MB; phones' photos are well under this

export interface CropBox {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  outW: number;
  outH: number;
}

/** Centre crop of a width×height image to 16:9, scaled down to at most maxWidth wide. */
export function centerCrop16x9(width: number, height: number, maxWidth = 1600): CropBox {
  let sw = width;
  let sh = height;
  if (width / height > POSTCARD_ASPECT) sw = Math.round(height * POSTCARD_ASPECT); // too wide → trim sides
  else sh = Math.round(width / POSTCARD_ASPECT); // too tall → trim top & bottom
  const outW = Math.min(maxWidth, sw);
  return {
    sx: Math.round((width - sw) / 2),
    sy: Math.round((height - sh) / 2),
    sw,
    sh,
    outW,
    outH: Math.round(outW / POSTCARD_ASPECT),
  };
}

/**
 * Crops a photo to 16:9 and re-encodes it as JPEG in the browser. Re-encoding also strips EXIF
 * metadata — including the GPS position phones embed in photos.
 */
export async function preparePostcardImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG, PNG or WebP).');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That photo is over 15 MB — please choose a smaller one.');

  const bitmap = await createImageBitmap(file); // honours EXIF orientation in modern browsers
  const box = centerCrop16x9(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = box.outW;
  canvas.height = box.outH;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser can’t process images.');
  context.drawImage(bitmap, box.sx, box.sy, box.sw, box.sh, 0, 0, box.outW, box.outH);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Couldn’t process that image.'))),
      'image/jpeg',
      0.85
    )
  );
}
