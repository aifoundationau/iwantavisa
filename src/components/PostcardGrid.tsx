import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { scrollBelowHeader } from '../lib/scroll';

/** Postcards sit 2 to a row on every screen (Android and iPhone included) … */
export const POSTCARD_COLUMNS = 2;
/** … and arrive 3 rows at a time, then a More button shows the next 3 rows. */
export const POSTCARD_ROWS_PER_PAGE = 3;
export const POSTCARDS_PER_PAGE = POSTCARD_COLUMNS * POSTCARD_ROWS_PER_PAGE;

/** How many postcards are visible after `pages` pages (never more than there are). */
export function visiblePostcardCount(total: number, pages: number): number {
  return Math.min(Math.max(0, total), Math.max(1, Math.floor(pages)) * POSTCARDS_PER_PAGE);
}

interface PostcardGridProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** The grid starts again from the first 3 rows whenever this changes (new filter, category…). */
  resetKey?: string;
  /** 'ol' for ranked results. */
  as?: 'ul' | 'ol';
  /** data-testid of the list; the More button is `${testId}-more-btn`. */
  testId: string;
  ariaLabel?: string;
  itemTestId?: (item: T, index: number) => string | undefined;
  /** Used in "More postcards" and "Showing 6 of 9 postcards". */
  noun?: string;
}

export function PostcardGrid<T>({
  items,
  getKey,
  renderItem,
  resetKey = '',
  as = 'ul',
  testId,
  ariaLabel,
  itemTestId,
  noun = 'postcards',
}: PostcardGridProps<T>) {
  // Paging belongs to one filter: a new resetKey means page 1 again (no effect-driven reset flash).
  const [paging, setPaging] = useState({ resetKey, pages: 1 });
  const pages = paging.resetKey === resetKey ? paging.pages : 1;
  const shown = visiblePostcardCount(items.length, pages);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const revealFrom = useRef<number | null>(null);

  // After "More", the first new row moves to the top of the screen: the next screen of postcards.
  useEffect(() => {
    const index = revealFrom.current;
    revealFrom.current = null;
    if (index === null) return;
    const first = wrapperRef.current?.querySelector<HTMLElement>(`[data-postcard-index="${index}"]`);
    if (!first) return;
    first.focus({ preventScroll: true }); // keyboard and screen-reader users continue from here
    scrollBelowHeader(first);
  }, [shown]);

  const showMore = () => {
    revealFrom.current = shown;
    setPaging({ resetKey, pages: pages + 1 });
  };

  const List = as;
  return (
    <div ref={wrapperRef} className="space-y-4">
      <List
        aria-label={ariaLabel}
        data-agent-id={testId}
        data-testid={testId}
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
      >
        {items.slice(0, shown).map((item, index) => (
          <li
            key={getKey(item)}
            tabIndex={-1}
            data-postcard-index={index}
            data-testid={itemTestId?.(item, index)}
            className="min-w-0 flex flex-col gap-1.5 sm:gap-2 rounded-3xl focus:outline-none [&>article]:flex-1"
          >
            {renderItem(item, index)}
          </li>
        ))}
      </List>

      {shown < items.length && (
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={showMore}
            data-agent-id={`${testId}-more-btn`}
            data-testid={`${testId}-more-btn`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-8 rounded-2xl bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 text-sm font-extrabold shadow-md hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60"
          >
            More {noun}
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
          <span
            data-testid={`${testId}-count`}
            className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums"
          >
            Showing {shown} of {items.length}
          </span>
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {pages > 1 ? `Showing ${shown} of ${items.length} ${noun}` : ''}
      </p>
    </div>
  );
}
