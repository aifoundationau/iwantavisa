import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { scrollBelowHeader } from '../lib/scroll';

interface SharedPostcardSpotlightProps {
  /** e.g. "shared-offer" → shared-offer-spotlight, shared-offer-heading, dismiss-shared-offer-btn. */
  idBase: string;
  source?: 'link' | 'search';
  heading: string;
  /** Shown under the heading when the shared postcard no longer exists. */
  missingHint?: string;
  dismissLabel: string;
  onDismiss: () => void;
  /** The spotlight scrolls into view (below the sticky header) whenever this changes. */
  scrollKey: string;
  /** The pinned postcard; omit when it no longer exists. */
  children?: React.ReactNode;
}

/** A postcard opened from a shared link (or search), pinned above its board. */
export const SharedPostcardSpotlight: React.FC<SharedPostcardSpotlightProps> = ({
  idBase,
  source = 'link',
  heading,
  missingHint,
  dismissLabel,
  onDismiss,
  scrollKey,
  children,
}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) scrollBelowHeader(ref.current, 16);
  }, [scrollKey]);

  return (
    <section
      ref={ref}
      aria-labelledby={`${idBase}-heading`}
      data-agent-id={`${idBase}-spotlight`}
      data-testid={`${idBase}-spotlight`}
      className="rounded-3xl bg-amber-50/90 dark:bg-slate-900 border-2 border-amber-500 p-4 sm:p-6 space-y-4 shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-700 dark:text-amber-400">
            {source === 'search' ? '🔍 From your search' : '📬 Shared with you'}
          </span>
          <h2 id={`${idBase}-heading`} className="text-lg font-extrabold text-slate-900 dark:text-white">
            {heading}
          </h2>
          {missingHint && <p className="text-xs text-slate-600 dark:text-slate-400">{missingHint}</p>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          data-agent-id={`dismiss-${idBase}-btn`}
          data-testid={`dismiss-${idBase}-btn`}
          className="w-8 h-8 shrink-0 rounded-full bg-white dark:bg-slate-800 border border-amber-500/40 flex items-center justify-center text-slate-700 dark:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children && <div className="max-w-2xl mx-auto">{children}</div>}
    </section>
  );
};
