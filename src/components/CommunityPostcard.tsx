import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { COMMUNITY_CATEGORY_EMOJI, MERCHANT_CITY_STAMP_CODES } from '../data/cambodiaData';
import { cityInText, eventDateSticker } from '../lib/postcards';
import { buildCommunityPostShareUrl } from '../lib/share';
import { TechCommunityPost } from '../types/contracts';
import { PostcardAddress, PostcardFrame, postcardLayout, PostcardStamps } from './PostcardFrame';

interface CommunityPostcardProps {
  post: TechCommunityPost;
  /** Keeps element IDs unique when one post renders twice (grid + dialog, spotlight). */
  idPrefix?: string;
  /** A card in the 2-up grid: compact face below lg, full postcard from lg up. */
  compact?: boolean;
  /** Tapping the front opens the full postcard (photos, details, share links). */
  onOpen?: (post: TechCommunityPost) => void;
  onToggleRsvp?: (postId: string) => void;
}

/** A meetup, hackathon or founder topic from the Tech Community board, as a postcard. */
export const CommunityPostcard: React.FC<CommunityPostcardProps> = ({
  post,
  idPrefix = post.id,
  compact = false,
  onOpen,
  onToggleRsvp,
}) => {
  const L = postcardLayout(compact);
  const city = cityInText(post.hubLocation);
  const place = city ?? 'Cambodia';
  const day = eventDateSticker(post.eventDate);
  const joined = Boolean(post.rsvpJoined);
  const rsvpWords = joined ? `✓ Joined (${post.attendeesCount})` : `RSVP / Join (${post.attendeesCount})`;

  return (
    <PostcardFrame
      testId={`community-postcard-${idPrefix}`}
      idPrefix={idPrefix}
      headlineId={`community-headline-${idPrefix}`}
      compact={compact}
      photos={post.imageUrls ?? []}
      photoAlt={`${post.title} — ${post.authorName}`}
      art={{ emoji: post.avatarEmoji, place }}
      chip={{ emoji: COMMUNITY_CATEGORY_EMOJI[post.category], label: post.category }}
      sticker={day ? { text: day, testId: `community-date-sticker-${idPrefix}` } : undefined}
      open={
        onOpen && {
          onOpen: () => onOpen(post),
          label: `Open postcard: ${post.title} — ${post.authorName}`,
          testId: `community-open-btn-${idPrefix}`,
        }
      }
      kicker="✈️ Par Avion • Tech Community"
      headline={post.title}
      byline={`${post.authorName} · ${place}`}
      message={
        <>
          <p className={`text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed ${L.wideOnly}`}>
            “{post.summary}”
          </p>
          {post.eventDate && (
            <p
              className={`items-center gap-1 pt-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 ${L.wideOnlyFlex}`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
              {post.eventDate}
            </p>
          )}
        </>
      }
      address={
        <>
          <PostcardStamps
            postmarkLabel={city ? `${MERCHANT_CITY_STAMP_CODES[city]} • KH` : 'Cambodia'}
            postedAt={post.createdAt}
            stampEmoji={post.avatarEmoji}
            stampCode={post.id}
          />
          <PostcardAddress
            heading="From the community"
            name={post.authorName}
            lines={[
              { text: post.authorRole },
              {
                icon: <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-px" aria-hidden="true" />,
                text: post.hubLocation,
              },
            ]}
          />
        </>
      }
      actions={
        onToggleRsvp ? (
          <button
            type="button"
            onClick={() => onToggleRsvp(post.id)}
            aria-pressed={joined}
            aria-label={`RSVP: ${post.title} (${post.attendeesCount} going)`}
            data-agent-id={`rsvp-community-btn-${idPrefix}`}
            data-testid={`rsvp-community-btn-${idPrefix}`}
            className={`inline-flex items-center rounded-lg font-extrabold transition-colors ${L.pillBtn} ${
              joined
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-400 hover:text-slate-950'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {compact ? (
              <>
                <span className="lg:hidden tabular-nums">
                  {joined ? '✓ ' : ''}
                  {post.attendeesCount}
                </span>
                <span className="hidden lg:inline">{rsvpWords}</span>
              </>
            ) : (
              rsvpWords
            )}
          </button>
        ) : (
          <span
            className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 ${
              compact ? 'mr-auto lg:mr-0' : ''
            }`}
          >
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {post.attendeesCount} going
          </span>
        )
      }
      share={{
        url: buildCommunityPostShareUrl(post.id),
        title: `${post.title} — ${post.hubLocation}`,
        text: `📮 ${post.title}${post.eventDate ? ` · ${post.eventDate}` : ''} — ${post.hubLocation} 🇰🇭 via I Want A Visa Cambodia`,
      }}
      compactShareTestId={`community-compact-share-btn-${idPrefix}`}
    />
  );
};
