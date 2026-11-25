import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { preparePostcardImage } from '../lib/images';
import { isImageUploadConfigured, uploadSlug, uploadToImgbb } from '../lib/imgbb';

interface ImageUploadFieldProps {
  /** The uploaded image's https://i.ibb.co/… URL, or '' */
  value: string;
  onChange: (url: string) => void;
  /** Used for the file name on imgbb, e.g. the business + headline. */
  uploadName: string;
  idPrefix: string;
  label: string;
  hint?: string;
}

/** Upload a photo to imgbb, cropped to the 16:9 postcard format in the browser first. */
export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  uploadName,
  idPrefix,
  label,
  hint,
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'uploading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputId = `${idPrefix}-file`;
  const busy = status !== 'idle';
  const preview = busy ? localPreview : value || null;

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    },
    [localPreview]
  );

  const handleFile = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = ''; // allow choosing the same file again
    if (!file) return;
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setStatus('processing');
      const image = await preparePostcardImage(file);
      setLocalPreview(URL.createObjectURL(image));
      setStatus('uploading');
      const uploaded = await uploadToImgbb(image, uploadSlug(uploadName), controller.signal);
      onChange(uploaded.url);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Upload failed — please try again.');
    } finally {
      if (!controller.signal.aborted) setStatus('idle');
    }
  };

  return (
    <div>
      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
        {label} <span className="font-normal text-slate-500">(16:9 — we crop it for you)</span>
      </span>
      <input
        id={fileInputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy || !isImageUploadConfigured}
        onChange={(e) => void handleFile(e.currentTarget)}
        data-agent-id={`${idPrefix}-file-input`}
        data-testid={`${idPrefix}-file-input`}
        className="peer sr-only"
      />
      <div
        data-testid={`${idPrefix}-dropzone`}
        className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed border-amber-400/70 bg-amber-50/60 dark:bg-slate-800 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500"
      >
        {preview ? (
          <img
            src={preview}
            alt="Postcard photo preview"
            data-testid={`${idPrefix}-preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <label
            htmlFor={fileInputId}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 cursor-pointer text-amber-800 dark:text-amber-300 text-xs font-bold text-center px-3"
          >
            <ImagePlus className="w-6 h-6" />
            Upload a photo
            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
              JPG, PNG or WebP · up to 15 MB
            </span>
          </label>
        )}
        {busy && (
          <div
            role="status"
            className="absolute inset-0 bg-slate-950/55 flex items-center justify-center gap-2 text-white text-xs font-bold"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            {status === 'processing' ? 'Cropping to 16:9…' : 'Uploading to imgbb…'}
          </div>
        )}
      </div>

      {value && !busy && (
        <div className="mt-2 flex gap-2">
          <label
            htmlFor={fileInputId}
            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200"
          >
            <RefreshCw className="w-3 h-3" /> Replace
          </label>
          <button
            type="button"
            onClick={() => onChange('')}
            data-testid={`${idPrefix}-remove-btn`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[11px] font-bold"
          >
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        </div>
      )}
      {error && (
        <p role="alert" data-testid={`${idPrefix}-error`} className="mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-300">
          {error}
        </p>
      )}
      {!isImageUploadConfigured && (
        <p className="mt-1 text-[10px] text-slate-500">Photo uploads aren’t set up (VITE_IMGBB_API_KEY).</p>
      )}
      {hint && <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
};
