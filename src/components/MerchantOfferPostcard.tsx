import React from 'react';
import { ExternalLink, MapPin, MessageCircle, Newspaper, Phone } from 'lucide-react';
import { MERCHANT_CATEGORY_META, MERCHANT_CITY_STAMP_CODES } from '../data/cambodiaData';
import { NO_RATING, RatingSummary } from '../lib/reviews';
import { buildOfferShareUrl } from '../lib/share';
import { MerchantOffer } from '../types/contracts';
import { PostcardAddress, PostcardFrame, postcardLayout, PostcardStamps } from './PostcardFrame';
import { RatingBadge } from './StarRating';

interface MerchantOfferPostcardProps {
  offer: MerchantOffer;
  /** Keeps element IDs unique when one offer renders twice (pinned share, post preview). */
  idPrefix?: string;
  /** The merchant's approved-review rating. */
  rating?: RatingSummary;
  onOpenReviews?: (merchantId: string) => void;
  /** Omit for the merchant's own postcards. */
  onMessage?: (offer: MerchantOffer) => void;
  /**
   * A card in a 2-up postcard grid. Below lg (phones, tablets) it shows its compact face — front,
   * headline, merchant, rating, message and share — and the full postcard from lg up.
   */
  compact?: boolean;
  /** Tapping the front opens the full postcard (message, address, every share button). */
  onOpen?: (offer: MerchantOffer) => void;
}

export const MerchantOfferPostcard: React.FC<MerchantOfferPostcardProps> = ({
  offer,
  idPrefix = offer.id,
  rating,
  onOpenReviews,
  onMessage,
  compact = false,
  onOpen,
}) => {
  const meta = MERCHANT_CATEGORY_META[offer.category];
  const L = postcardLayout(compact);
  const hasActions = Boolean(rating || onOpenReviews || onMessage);

  return (
    <PostcardFrame
      testId={`merchant-offer-postcard-${idPrefix}`}
      idPrefix={idPrefix}
      headlineId={`offer-headline-${idPrefix}`}
      compact={compact}
      photos={offer.imageUrl ? [offer.imageUrl] : []}
      photoAlt={`${offer.headline} — ${offer.businessName}`}
      art={{ emoji: meta.emoji, place: offer.city }}
      chip={{ emoji: meta.emoji, label: meta.label }}
      sticker={{ text: offer.dealBadge }}
      open={
        onOpen && {
          onOpen: () => onOpen(offer),
          label: `Open postcard: ${offer.headline} — ${offer.businessName}`,
          testId: `offer-open-btn-${idPrefix}`,
        }
      }
      kicker="✈️ Par Avion • Merchant Offer"
      headline={offer.headline}
      byline={`${offer.businessName} · ${offer.city}`}
      message={
        <>
          <p className={`text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed ${L.wideOnly}`}>
            “{offer.message}”
          </p>
          {offer.linkedInPulseUrl && (
            <a
              href={offer.linkedInPulseUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-agent-id={`offer-linkedin-pulse-link-${idPrefix}`}
              data-testid={`offer-linkedin-pulse-link-${idPrefix}`}
              className={`items-center gap-1.5 pt-1 text-[11px] font-extrabold text-[#0A66C2] dark:text-sky-400 hover:underline ${L.wideOnlyFlex}`}
            >
              <Newspaper className="w-3.5 h-3.5 shrink-0" />
              Read the full story on LinkedIn Pulse
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          )}
        </>
      }
      address={
        <>
          <PostcardStamps
            postmarkLabel={`${MERCHANT_CITY_STAMP_CODES[offer.city]} • KH`}
            postedAt={offer.createdAt}
            stampEmoji={meta.emoji}
            stampCode={offer.postcardStampCode}
          />
          <PostcardAddress
            heading="From the merchant"
            name={offer.businessName}
            lines={[
              {
                icon: <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-px" aria-hidden="true" />,
                text: `${offer.addressLine}, ${offer.city}`,
              },
              {
                icon: <Phone className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />,
                text: offer.contact,
                mono: true,
              },
            ]}
          />
        </>
      }
      actions={
        hasActions ? (
          <>
            {onOpenReviews ? (
              <button
                type="button"
                onClick={() => onOpenReviews(offer.merchantId)}
                aria-label={`Reviews of ${offer.businessName}`}
                data-agent-id={`offer-reviews-btn-${idPrefix}`}
                data-testid={`offer-reviews-btn-${idPrefix}`}
                className={`inline-flex items-center rounded-lg bg-amber-500/10 border border-amber-500/30 font-bold hover:bg-amber-500/20 ${L.reviewsBtn}`}
              >
                <RatingBadge summary={rating ?? NO_RATING} shortBelowLg={compact} />
                <span className={`text-amber-800 dark:text-amber-300 underline ${L.reviewsWord}`}>Reviews</span>
              </button>
            ) : (
              rating && (
                <span
                  className={`text-[10px] sm:text-[11px] ${compact ? 'mr-auto lg:mr-0' : ''}`}
                  data-testid={`offer-rating-${idPrefix}`}
                >
                  <RatingBadge summary={rating} shortBelowLg={compact} />
                </span>
              )
            )}
            {onMessage && (
              <button
                type="button"
                onClick={() => onMessage(offer)}
                aria-label={`Message ${offer.businessName}`}
                title={`Message ${offer.businessName}`}
                data-agent-id={`offer-message-btn-${idPrefix}`}
                data-testid={`offer-message-btn-${idPrefix}`}
                className={`inline-flex items-center rounded-lg bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 text-[11px] font-extrabold hover:opacity-95 ${L.messageBtn}`}
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className={L.messageWord}>Message {offer.businessName.split(' ')[0]}</span>
              </button>
            )}
          </>
        ) : undefined
      }
      share={{
        url: buildOfferShareUrl(offer.id),
        title: `${offer.dealBadge}: ${offer.headline} — ${offer.businessName}`,
        text: `📮 ${offer.dealBadge} — ${offer.headline} at ${offer.businessName}, ${offer.city} 🇰🇭 via I Want A Visa Cambodia`,
      }}
      compactShareTestId={`offer-compact-share-btn-${idPrefix}`}
    />
  );
};
