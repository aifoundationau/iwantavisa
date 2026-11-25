import React, { useRef } from 'react';
import { Star } from 'lucide-react';
import { RatingSummary } from '../lib/reviews';

/** Five stars with the first `value` filled (an individual review). */
export const Stars: React.FC<{ value: number; className?: string }> = ({ value, className = 'w-3.5 h-3.5' }) => (
  <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        aria-hidden="true"
        className={`${className} ${n <= value ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
      />
    ))}
  </span>
);

/**
 * "★ 4.5 · 2 reviews" summary of a merchant's approved reviews.
 * shortBelowLg: "★ 4.5 · 2" on phones and tablets (compact postcards), full wording from lg up.
 */
export const RatingBadge: React.FC<{ summary: RatingSummary; compact?: boolean; shortBelowLg?: boolean }> = ({
  summary,
  compact = false,
  shortBelowLg = false,
}) => {
  const wideOnly = shortBelowLg ? 'hidden lg:inline' : undefined;
  if (summary.average === null || summary.count === 0) {
    return (
      <span className="text-slate-500 dark:text-slate-400">
        {compact ? 'No reviews' : <>No reviews<span className={wideOnly}> yet</span></>}
      </span>
    );
  }
  const label = `${summary.count} review${summary.count === 1 ? '' : 's'}`;
  return (
    <span
      role="img"
      className="inline-flex items-center gap-1 whitespace-nowrap"
      aria-label={`Rated ${summary.average.toFixed(1)} out of 5 from ${label}`}
    >
      <Star aria-hidden="true" className={`${shortBelowLg ? 'w-3 h-3 lg:w-3.5 lg:h-3.5' : 'w-3.5 h-3.5'} fill-amber-400 text-amber-500`} />
      <strong className="text-slate-900 dark:text-white">{summary.average.toFixed(1)}</strong>
      <span className="text-slate-500 dark:text-slate-400">
        · {compact ? summary.count : <>{summary.count}<span className={wideOnly}> review{summary.count === 1 ? '' : 's'}</span></>}
      </span>
    </span>
  );
};

/** Accessible 1–5 star picker (radio group with roving focus; arrow keys move between stars). */
export const StarInput: React.FC<{ value: number; onChange: (value: number) => void; idPrefix: string }> = ({
  value,
  onChange,
  idPrefix,
}) => {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (n: number) => {
    onChange(n);
    buttons.current[n - 1]?.focus();
  };

  return (
    <div role="radiogroup" aria-label="Your rating" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          ref={(el) => {
            buttons.current[n - 1] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          onClick={() => onChange(n)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault();
              select(Math.min(5, (value || 0) + 1));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault();
              select(Math.max(1, (value || 2) - 1));
            }
          }}
          data-agent-id={`${idPrefix}-star-${n}`}
          data-testid={`${idPrefix}-star-${n}`}
          className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Star className={`w-7 h-7 ${n <= value ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
        </button>
      ))}
    </div>
  );
};
