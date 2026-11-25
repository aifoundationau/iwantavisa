import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import { preparePostcardImage } from '../lib/images';
import { isImageUploadConfigured, uploadSlug, uploadToImgbb } from '../lib/imgbb';
import { MAX_POSTCARD_PHOTOS } from '../types/contracts';

interface PhotosUploadFieldProps {
  /** Uploaded https://i.ibb.co/… links, cover first. */
  value: string[];
  /** A state setter: uploads finishing one after another add to the latest list. */
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  /** Used for the file names on imgbb, e.g. the agency + service title. */
  uploadName: string;
  idPrefix: string;
  label: string;
  hint?: string;
  max?: number;
}

interface PendingPhoto {
  key: string;
  name: string;
  /** Object URL of the chosen file, shown until its upload finishes. */
  preview: string;
  status: 'queued' | 'cropping' | 'uploading';
}

const STATUS_TEXT: Record<PendingPhoto['status'], string> = {
  queued: 'Waiting…',
  cropping: 'Cropping…',
  uploading: 'Uploading…',
};

const THUMB_BUTTON =
  'w-6 h-6 rounded-full bg-slate-950/65 hover:bg-slate-950/85 text-white flex items-center justify-center shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

/**
 * Several postcard photos: each is cropped to 16:9 in the browser (which also strips EXIF/GPS),
 * then uploaded to imgbb one at a time. The first photo is the cover shown on grid cards.
 */
export const PhotosUploadField: React.FC<PhotosUploadFieldProps> = ({
  value,
  onChange,
  uploadName,
  idPrefix,
  label,
  hint,
  max = MAX_POSTCARD_PHOTOS,
}) => {
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const previewsRef = useRef(new Set<string>());
  const busy = pending.length > 0;
  const room = Math.max(0, max - value.length - pending.length);
  const inputId = `${idPrefix}-file`;
  const labelId = `${idPrefix}-label`;

  // Leaving the form cancels uploads in flight and frees the previews.
  useEffect(() => {
    const previews = previewsRef.current;
    return () => {
      abortRef.current?.abort();
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFiles = async (input: HTMLInputElement) => {
    const files = Array.from(input.files ?? []);
    input.value = ''; // allow choosing the same files again
    if (files.length === 0 || busy) return;

    const accepted = files.slice(0, room);
    const left = files.length - accepted.length;
    setErrors(
      left > 0
        ? [`Up to ${max} photos per postcard — ${left} photo${left === 1 ? ' was' : 's were'} not added.`]
        : []
    );
    if (accepted.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;
    const stamp = Date.now();
    const batch: PendingPhoto[] = accepted.map((file, i) => {
      const preview = URL.createObjectURL(file);
      previewsRef.current.add(preview);
      return { key: `${stamp}-${i}`, name: file.name, preview, status: 'queued' };
    });
    setPending(batch);
    const slug = uploadSlug(uploadName);

    for (const [i, item] of batch.entries()) {
      if (controller.signal.aborted) return;
      const setStatus = (status: PendingPhoto['status']) =>
        setPending((prev) => prev.map((p) => (p.key === item.key ? { ...p, status } : p)));
      try {
        setStatus('cropping');
        const image = await preparePostcardImage(accepted[i]);
        setStatus('uploading');
        const uploaded = await uploadToImgbb(image, `${slug}-${i + 1}`, controller.signal);
        onChange((prev) => (prev.length >= max || prev.includes(uploaded.url) ? prev : [...prev, uploaded.url]));
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Upload failed — please try again.';
        setErrors((prev) => [...prev, `${item.name}: ${message}`]);
      } finally {
        if (!controller.signal.aborted) setPending((prev) => prev.filter((p) => p.key !== item.key));
        URL.revokeObjectURL(item.preview);
        previewsRef.current.delete(item.preview);
      }
    }
  };

  const remove = (index: number) => onChange((prev) => prev.filter((_, i) => i !== index));
  const makeCover = (index: number) =>
    onChange((prev) => (prev[index] === undefined ? prev : [prev[index], ...prev.filter((_, i) => i !== index)]));

  const addDisabled = busy || !isImageUploadConfigured;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span id={labelId} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}{' '}
          <span className="font-normal text-slate-500">· up to {max} · 16:9, we crop them for you</span>
        </span>
        <span
          data-testid={`${idPrefix}-count`}
          className="shrink-0 text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums"
        >
          {value.length}/{max}
        </span>
      </div>

      <ul aria-labelledby={labelId} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {value.map((url, i) => (
          <li
            key={url}
            className="relative rounded-lg overflow-hidden border border-amber-400/60 bg-slate-100 dark:bg-slate-800"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}${i === 0 ? ' (cover)' : ''}`}
              data-testid={`${idPrefix}-photo-${i}`}
              referrerPolicy="no-referrer"
              className="block w-full aspect-video object-cover"
            />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-[#0F2557]/90 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5">
                Cover
              </span>
            )}
            <span className="absolute top-1 right-1 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  aria-label={`Use photo ${i + 1} as the cover`}
                  title="Use as cover"
                  data-agent-id={`${idPrefix}-cover-btn-${i}`}
                  data-testid={`${idPrefix}-cover-btn-${i}`}
                  className={THUMB_BUTTON}
                >
                  <Star className="w-3 h-3" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove photo ${i + 1}`}
                title="Remove"
                data-agent-id={`${idPrefix}-remove-btn-${i}`}
                data-testid={`${idPrefix}-remove-btn-${i}`}
                className={THUMB_BUTTON}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}

        {pending.map((photo) => (
          <li
            key={photo.key}
            data-testid={`${idPrefix}-pending`}
            className="relative rounded-lg overflow-hidden border border-dashed border-amber-400/70"
          >
            <img src={photo.preview} alt="" className="block w-full aspect-video object-cover opacity-60" />
            <span
              role="status"
              className="absolute inset-0 bg-slate-950/55 flex items-center justify-center gap-1 px-1 text-center text-white text-[10px] font-bold"
            >
              <Loader2 className="w-3 h-3 animate-spin shrink-0" aria-hidden="true" />
              {STATUS_TEXT[photo.status]}
            </span>
          </li>
        ))}

        {room > 0 && (
          <li>
            <label
              htmlFor={inputId}
              className={`flex flex-col items-center justify-center gap-0.5 w-full aspect-video rounded-lg border-2 border-dashed border-amber-400/70 bg-amber-50/60 dark:bg-slate-800 px-1 text-center text-[10px] font-bold text-amber-800 dark:text-amber-300 focus-within:ring-2 focus-within:ring-amber-500 ${
                addDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-amber-100/70 dark:hover:bg-slate-700'
              }`}
            >
              <input
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={addDisabled}
                onChange={(e) => void handleFiles(e.currentTarget)}
                data-agent-id={`${idPrefix}-file-input`}
                data-testid={`${idPrefix}-file-input`}
                className="sr-only"
              />
              <ImagePlus className="w-5 h-5" aria-hidden="true" />
              {value.length + pending.length === 0 ? 'Add photos' : 'Add more'}
              <span className="font-normal text-slate-500 dark:text-slate-400">{room} left</span>
            </label>
          </li>
        )}
      </ul>

      {errors.length > 0 && (
        <div
          role="alert"
          data-testid={`${idPrefix}-error`}
          className="mt-1 space-y-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-300"
        >
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
      {!isImageUploadConfigured && (
        <p className="mt-1 text-[10px] text-slate-500">Photo uploads aren’t set up (VITE_IMGBB_API_KEY).</p>
      )}
      {hint && <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
};
