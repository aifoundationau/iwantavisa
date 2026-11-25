import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, Share2 } from 'lucide-react';
import { copyToClipboard } from '../lib/share';
import { ShareButtons } from './ShareButtons';

/**
 * The postcard every board shares — merchant offers, agent services and community posts:
 * airmail stripes, a 16:9 front (photos or an illustrated "Greetings from" card), and a back with
 * a message side and an address side (postmark, stamp, sender), then actions and share links.
 */

export const AIRMAIL_STRIPE_BG =
  'w-full bg-[repeating-linear-gradient(45deg,#B91C1C,#B91C1C_16px,#FFFDF7_16px,#FFFDF7_28px,#0F2557_28px,#0F2557_44px,#FFFDF7_44px,#FFFDF7_56px)]';
export const AIRMAIL_STRIPE_CLASS = `h-2.5 ${AIRMAIL_STRIPE_BG}`;

/** Full postcard (dialogs, shared spotlight, previews): the back splits into two sides from sm up. */
const FULL = {
  card: 'rounded-3xl',
  stripe: 'h-2.5',
  chip: 'top-2.5 left-2.5 sm:top-3 sm:left-3 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px]',
  chipLabel: '',
  sticker: 'bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border-2',
  photoBadge: 'top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 text-[10px] sm:text-[11px]',
  art: 'px-4 pt-8 pb-10 sm:py-0',
  artEmoji: 'text-3xl sm:text-5xl',
  artGreeting: 'mt-1 sm:mt-2 text-[9px] sm:text-[10px] tracking-[0.3em]',
  artCity: 'text-lg sm:text-2xl',
  back: 'p-5 grid grid-cols-1 sm:grid-cols-12 gap-4',
  messageSide: 'sm:col-span-7 sm:border-r-2 sm:pr-4 space-y-2',
  wideOnly: 'block',
  wideOnlyFlex: 'inline-flex',
  headline: 'text-base leading-snug',
  merchantLine: 'hidden',
  addressSide: 'sm:col-span-5 space-y-2.5',
  footer: 'border-t-2 px-5 pb-4 pt-3 space-y-3',
  actionRow: 'flex flex-wrap items-center gap-2',
  reviewsBtn: 'h-8 px-2.5 gap-2 text-[11px]',
  reviewsWord: '',
  messageBtn: 'h-8 px-3 gap-1.5',
  messageWord: '',
  pillBtn: 'h-8 px-3 gap-1.5 text-[11px]',
  shareRow: '',
};

/** Compact face below lg (2-up grids on phones and tablets); the full postcard from lg up. */
const COMPACT: typeof FULL = {
  card: 'rounded-2xl sm:rounded-3xl',
  stripe: 'h-1 sm:h-1.5 lg:h-2.5',
  chip: 'top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] sm:top-2.5 sm:left-2.5 sm:px-2.5 sm:py-1 lg:top-3 lg:left-3 lg:px-3 lg:text-[11px]',
  chipLabel: 'sr-only sm:not-sr-only',
  sticker:
    'bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px] border sm:border-2 sm:bottom-2.5 sm:right-2.5 sm:px-2.5 sm:py-1 sm:text-xs lg:bottom-3 lg:right-3 lg:px-3 lg:py-1.5 lg:text-sm',
  photoBadge:
    'top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] sm:top-2.5 sm:right-2.5 sm:px-2 lg:top-3 lg:right-3 lg:text-[11px]',
  // Phones: just the emoji and city, clear of the chip and the sticker.
  art: 'px-2 pt-2 pb-7 sm:pt-8 sm:pb-10 lg:py-0',
  artEmoji: 'text-xl leading-none sm:text-3xl lg:text-5xl',
  artGreeting: 'hidden sm:block mt-1 text-[9px] tracking-[0.3em] lg:mt-2 lg:text-[10px]',
  artCity: 'mt-1 sm:mt-0 text-xs sm:text-lg lg:text-2xl',
  back: 'px-2.5 pt-1.5 pb-0.5 sm:px-4 sm:pt-3 sm:pb-1 lg:p-5 grid grid-cols-1 lg:grid-cols-12 gap-1 lg:gap-4',
  messageSide: 'lg:col-span-7 lg:border-r-2 lg:pr-4 space-y-1 lg:space-y-2',
  wideOnly: 'hidden lg:block',
  wideOnlyFlex: 'hidden lg:inline-flex',
  headline: 'text-xs leading-tight sm:text-sm line-clamp-2 lg:line-clamp-none lg:text-base lg:leading-snug',
  merchantLine: 'lg:hidden',
  addressSide: 'hidden lg:block lg:col-span-5 space-y-2.5',
  footer: 'lg:border-t-2 px-2.5 pb-2 pt-1 sm:px-4 sm:pb-3 sm:pt-2 lg:px-5 lg:pb-4 lg:pt-3 lg:space-y-3',
  actionRow: 'flex items-center gap-1 sm:gap-1.5 lg:flex-wrap lg:gap-2',
  reviewsBtn: 'mr-auto lg:mr-0 min-w-0 h-7 px-1.5 gap-1 text-[10px] sm:text-[11px] lg:h-8 lg:px-2.5 lg:gap-2',
  reviewsWord: 'hidden lg:inline',
  messageBtn: 'shrink-0 h-7 w-7 justify-center lg:h-8 lg:w-auto lg:px-3 lg:gap-1.5',
  messageWord: 'hidden lg:inline',
  pillBtn: 'mr-auto lg:mr-0 min-w-0 h-7 px-2 gap-1 text-[10px] sm:text-[11px] lg:h-8 lg:px-3 lg:gap-1.5',
  shareRow: 'hidden lg:block',
};

export type PostcardLayout = typeof FULL;

/** Class names for a postcard's parts: the compact face (grids, below lg) or the full postcard. */
export const postcardLayout = (compact: boolean): PostcardLayout => (compact ? COMPACT : FULL);

const POSTMARK_TZ = 'Asia/Phnom_Penh';

export function formatPostmark(iso: string): { dayMonth: string; year: string; full: string } | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const dayMonth = date
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: POSTMARK_TZ })
    .toUpperCase();
  const year = date.toLocaleDateString('en-GB', { year: 'numeric', timeZone: POSTMARK_TZ });
  return { dayMonth, year, full: `${dayMonth} ${year}` };
}

// ---------------------------------------------------------------- front: photos or illustration

interface PostcardSticker {
  text: string;
  testId?: string;
}

interface FrontProps {
  layout: PostcardLayout;
  idPrefix: string;
  photos: readonly string[];
  alt: string;
  art: { emoji: string; place: string };
  chip: { emoji: string; label: string };
  sticker?: PostcardSticker;
  /** The full postcard lets people browse every photo; grid cards show the cover and a count. */
  browsable: boolean;
}

const SWIPE_MIN_PX = 40;
const GALLERY_BUTTON =
  'absolute top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/55 hover:bg-slate-950/75 backdrop-blur-sm text-white shadow flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

/** Photos to swipe through (or ‹ › buttons): the full postcard's front when there are several. */
const PhotoGallery: React.FC<{
  layout: PostcardLayout;
  idPrefix: string;
  photos: readonly string[];
  alt: string;
  overlays: React.ReactNode;
  onPhotoError: (src: string) => void;
}> = ({ layout: L, idPrefix, photos, alt, overlays, onPhotoError }) => {
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const current = Math.min(index, count - 1);
  const go = (step: number) => setIndex((i) => (Math.min(i, count - 1) + step + count) % count);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  return (
    <span
      role="group"
      aria-roledescription="carousel"
      aria-label={`${count} photos`}
      data-testid={`postcard-photos-${idPrefix}`}
      className="relative block"
    >
      {/* Horizontal swipes change photo; vertical ones still scroll the page (touch-action: pan-y). */}
      <span
        className="block w-full aspect-video overflow-hidden bg-slate-900 touch-pan-y select-none"
        onPointerDown={(e) => {
          swipeStart.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        <span
          className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {photos.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${alt} — photo ${i + 1} of ${count}`}
              aria-hidden={i === current ? undefined : true}
              draggable={false}
              referrerPolicy="no-referrer"
              onError={() => onPhotoError(src)}
              data-testid={`postcard-photo-${idPrefix}-${i}`}
              className="block w-full h-full shrink-0 object-cover"
            />
          ))}
        </span>
      </span>

      {overlays}

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous photo"
        data-agent-id={`postcard-photo-prev-${idPrefix}`}
        data-testid={`postcard-photo-prev-${idPrefix}`}
        className={`${GALLERY_BUTTON} left-2`}
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next photo"
        data-agent-id={`postcard-photo-next-${idPrefix}`}
        data-testid={`postcard-photo-next-${idPrefix}`}
        className={`${GALLERY_BUTTON} right-2`}
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>

      <span
        aria-hidden="true"
        data-testid={`postcard-photo-counter-${idPrefix}`}
        className={`absolute rounded-full bg-slate-950/65 text-white font-extrabold tabular-nums shadow pointer-events-none ${L.photoBadge}`}
      >
        {current + 1} / {count}
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none"
      >
        {photos.map((src, i) => (
          <span
            key={src}
            className={`h-1.5 rounded-full shadow transition-all ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
          />
        ))}
      </span>
      <span className="sr-only" aria-live="polite">
        Photo {current + 1} of {count}
      </span>
    </span>
  );
};

/** The 16:9 front: the photo(s), else an illustrated "Greetings from {place}" card. */
const PostcardFront: React.FC<FrontProps> = ({ layout: L, idPrefix, photos, alt, art, chip, sticker, browsable }) => {
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const shown = photos.filter((src) => !failed.has(src));
  const markFailed = (src: string) => setFailed((prev) => new Set(prev).add(src));

  const overlays = (
    <>
      <span
        className={`absolute rounded-full bg-[#0F2557]/90 backdrop-blur-md text-amber-300 font-extrabold shadow-md whitespace-nowrap pointer-events-none ${L.chip}`}
      >
        <span aria-hidden="true">{chip.emoji}</span>
        <span className={L.chipLabel}> {chip.label}</span>
      </span>
      {sticker && (
        <span
          data-agent-id={sticker.testId}
          data-testid={sticker.testId}
          className={`absolute -rotate-6 rounded-lg bg-rose-700 text-white font-extrabold tracking-wide shadow-lg border-white/80 whitespace-nowrap pointer-events-none ${L.sticker}`}
        >
          {sticker.text}
        </span>
      )}
    </>
  );

  // Spans throughout: the front may sit inside a button (grid cards open the full postcard).
  if (shown.length === 0) {
    return (
      <span className="relative block">
        {/* 16:9 like every postcard image; padding keeps the art clear of the chip and sticker. */}
        <span
          className={`relative w-full aspect-video min-h-0 overflow-hidden bg-gradient-to-br from-[#0F2557] via-[#1E3A8A] to-[#7F1D1D] flex flex-col items-center justify-center text-center ${L.art}`}
        >
          <span aria-hidden="true" className="absolute inset-0 angkor-pattern-bg" />
          <span aria-hidden="true" className={`relative drop-shadow ${L.artEmoji}`}>
            {art.emoji}
          </span>
          <span className={`relative font-extrabold uppercase text-amber-200/90 ${L.artGreeting}`}>
            Greetings from
          </span>
          <span className={`relative font-extrabold uppercase tracking-wide text-amber-300 ${L.artCity}`}>
            {art.place}
          </span>
        </span>
        {overlays}
      </span>
    );
  }

  if (browsable && shown.length > 1) {
    return (
      <PhotoGallery
        layout={L}
        idPrefix={idPrefix}
        photos={shown}
        alt={alt}
        overlays={overlays}
        onPhotoError={markFailed}
      />
    );
  }

  const count = shown.length;
  return (
    <span className="relative block">
      <img
        src={shown[0]}
        alt={count > 1 ? `${alt} — photo 1 of ${count}` : alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => markFailed(shown[0])}
        className="block w-full aspect-video object-cover"
      />
      {overlays}
      {count > 1 && (
        <span
          data-testid={`postcard-photo-count-${idPrefix}`}
          className={`absolute inline-flex items-center gap-1 rounded-full bg-slate-950/65 text-white font-extrabold tabular-nums shadow pointer-events-none ${L.photoBadge}`}
        >
          <Images className="w-3 h-3" aria-hidden="true" />
          {count}
          <span className="sr-only"> photos</span>
        </span>
      )}
    </span>
  );
};

// ---------------------------------------------------------------- address side helpers

/** Postmark (place code and date) and the stamp, top of the address side. */
export const PostcardStamps: React.FC<{
  /** e.g. "PNH • KH" */
  postmarkLabel: string;
  postedAt?: string;
  stampEmoji: string;
  stampCode: string;
}> = ({ postmarkLabel, postedAt, stampEmoji, stampCode }) => {
  const postmark = postedAt ? formatPostmark(postedAt) : null;
  return (
    <>
      <div aria-hidden="true" className="flex items-start justify-between gap-2">
        {postmark ? (
          <div className="w-16 h-16 rounded-full border-2 border-slate-400/70 dark:border-slate-500 flex flex-col items-center justify-center -rotate-12 text-slate-500 dark:text-slate-400 leading-tight">
            <span className="text-[7px] font-extrabold uppercase tracking-widest">{postmarkLabel}</span>
            <span className="text-[10px] font-mono font-extrabold">{postmark.dayMonth}</span>
            <span className="text-[8px] font-mono font-bold">{postmark.year}</span>
          </div>
        ) : (
          <span />
        )}
        <div className="w-14 h-16 rounded-md bg-amber-100/90 dark:bg-slate-800 border-2 border-dashed border-amber-700 flex flex-col items-center justify-center shadow-inner px-0.5">
          <span className="text-xl">{stampEmoji}</span>
          <span className="font-mono text-[7px] font-bold text-rose-700 dark:text-rose-400 text-center break-all leading-tight">
            {stampCode}
          </span>
        </div>
      </div>
      {postmark && <span className="sr-only">Posted {postmark.full}</span>}
    </>
  );
};

export interface PostcardAddressLine {
  icon?: React.ReactNode;
  text: React.ReactNode;
  /** Contact details (Telegram, phone) in the typewriter style. */
  mono?: boolean;
}

/** "From …" block: the sender's name, then address lines. */
export const PostcardAddress: React.FC<{ heading: string; name: React.ReactNode; lines: PostcardAddressLine[] }> = ({
  heading,
  name,
  lines,
}) => (
  <div className="text-xs space-y-1">
    <div className="text-[10px] font-extrabold uppercase text-slate-400">{heading}</div>
    <div className="font-extrabold text-slate-900 dark:text-white border-b border-slate-300/80 dark:border-slate-700 pb-1">
      {name}
    </div>
    {lines.map((line, i) => (
      <div
        key={i}
        className={`flex items-start gap-1 text-[11px] ${
          line.mono ? 'font-mono text-amber-800 dark:text-amber-300 break-all' : 'text-slate-600 dark:text-slate-400'
        } ${i < lines.length - 1 ? 'border-b border-slate-300/80 dark:border-slate-700 pb-1' : ''}`}
      >
        {line.icon}
        <span>{line.text}</span>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------- the postcard

interface PostcardFrameProps {
  /** data-testid of the postcard (<article>). */
  testId: string;
  /** Keeps element IDs unique when one postcard renders twice (grid + dialog, spotlight, preview). */
  idPrefix: string;
  headlineId: string;
  /**
   * A card in a 2-up grid: below lg (phones, tablets) the compact face — front, headline, byline,
   * actions and one Share button — and the full postcard from lg up.
   */
  compact?: boolean;
  /** Photo links, cover first; none = the illustrated front. */
  photos?: readonly string[];
  photoAlt: string;
  /** The illustrated front: big emoji over "Greetings from {place}". */
  art: { emoji: string; place: string };
  /** Category chip, top left of the front. */
  chip: { emoji: string; label: string };
  /** Sticker, bottom right of the front (deal, price, event day). */
  sticker?: PostcardSticker;
  /** Makes the front a button that opens the full postcard. */
  open?: { onOpen: () => void; label: string; testId: string };
  /** Small caps line above the headline, e.g. "✈️ Par Avion • Merchant Offer". */
  kicker: string;
  headline: string;
  /** Compact face: "who · where" under the headline. */
  byline: string;
  /** The rest of the message side (full postcard). */
  message: React.ReactNode;
  /** Postmark, stamp and sender (full postcard). */
  address: React.ReactNode;
  /** Reviews / rating, message, RSVP… (the compact Share button is added after them). */
  actions?: React.ReactNode;
  /** Every share link opens this postcard back in the web app. */
  share: { url: string; title: string; text: string };
  compactShareTestId: string;
}

export const PostcardFrame: React.FC<PostcardFrameProps> = ({
  testId,
  idPrefix,
  headlineId,
  compact = false,
  photos = [],
  photoAlt,
  art,
  chip,
  sticker,
  open,
  kicker,
  headline,
  byline,
  message,
  address,
  actions,
  share,
  compactShareTestId,
}) => {
  const L = postcardLayout(compact);
  const front = (
    <PostcardFront
      layout={L}
      idPrefix={idPrefix}
      photos={photos}
      alt={photoAlt}
      art={art}
      chip={chip}
      sticker={sticker}
      browsable={!open}
    />
  );

  // Compact cards have one Share button: the phone's share sheet, else the full postcard's buttons.
  const shareCompact = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(share);
      } catch {
        // Dismissed — nothing to do.
      }
    } else if (open) {
      open.onOpen();
    } else {
      await copyToClipboard(share.url);
    }
  };

  const hasActions = Boolean(actions);

  return (
    <article
      aria-labelledby={headlineId}
      data-agent-id={testId}
      data-testid={testId}
      className={`bg-[#FFFDF7] dark:bg-slate-900 border-2 border-[#0F2557]/70 dark:border-amber-500/50 shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col ${L.card}`}
    >
      <div aria-hidden="true" className={`${L.stripe} ${AIRMAIL_STRIPE_BG}`} />

      {open ? (
        <button
          type="button"
          onClick={open.onOpen}
          aria-label={open.label}
          data-agent-id={open.testId}
          data-testid={open.testId}
          className="block w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-amber-400"
        >
          {front}
        </button>
      ) : (
        front
      )}

      {/* Postcard back: message side | address side */}
      <div className={`flex-1 ${L.back}`}>
        <div className={`border-dashed border-amber-600/40 ${L.messageSide}`}>
          <span
            className={`text-[10px] font-extrabold uppercase tracking-widest text-rose-700 dark:text-amber-400 ${L.wideOnly}`}
          >
            {kicker}
          </span>
          <h3 id={headlineId} className={`font-extrabold text-slate-900 dark:text-white ${L.headline}`}>
            {headline}
          </h3>
          <p
            className={`truncate text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 ${L.merchantLine}`}
          >
            {byline}
          </p>
          {message}
        </div>

        <div className={L.addressSide}>{address}</div>
      </div>

      <div className={`border-dashed border-amber-600/30 ${L.footer}`}>
        {(hasActions || compact) && (
          <div className={`${L.actionRow}${compact && !hasActions ? ' lg:hidden' : ''}`}>
            {actions}
            {compact && (
              <button
                type="button"
                onClick={() => void shareCompact()}
                aria-label={`Share ${headline}`}
                title="Share"
                data-agent-id={compactShareTestId}
                data-testid={compactShareTestId}
                className="lg:hidden shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-700 dark:text-amber-400 hover:border-amber-400"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Every share link opens this postcard back in the web app */}
        <div className={L.shareRow}>
          <ShareButtons url={share.url} title={share.title} text={share.text} idPrefix={idPrefix} />
        </div>
      </div>

      <div aria-hidden="true" className={`${L.stripe} ${AIRMAIL_STRIPE_BG}`} />
    </article>
  );
};
