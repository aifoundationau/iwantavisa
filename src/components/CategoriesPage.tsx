import React, { useMemo } from 'react';
import { ArrowLeft, LayoutGrid, Loader2, LocateFixed, MapPin } from 'lucide-react';
import { MERCHANT_CATEGORY_GROUPS, MERCHANT_CATEGORY_META } from '../data/cambodiaData';
import {
  MERCHANT_OFFER_CATEGORY_IDS,
  MerchantOffer,
  MerchantOfferCategory,
  MerchantProfile,
} from '../types/contracts';
import { formatDistance, LatLng } from '../lib/geo';
import { RatingSummary } from '../lib/reviews';
import { rankCategory } from '../lib/search';
import { MerchantOfferPostcard } from './MerchantOfferPostcard';
import { PostcardGrid } from './PostcardGrid';
import { RatingBadge } from './StarRating';

interface CategoriesPageProps {
  offers: MerchantOffer[];
  merchants: MerchantProfile[];
  ratings: Map<string, RatingSummary>;
  userPoint: LatLng | null;
  locationLabel: string | null;
  isDetecting: boolean;
  locationError: string | null;
  selectedCategory: MerchantOfferCategory | null;
  onSelectCategory: (category: MerchantOfferCategory | null) => void;
  onUseMyLocation: () => void;
  onOpenReviews: (merchantId: string) => void;
  onMessage: (offer: MerchantOffer) => void;
  /** The signed-in merchant, who shouldn't message their own postcards. */
  viewerMerchantId: string | null;
  /** Opens the full postcard from a compact grid card. */
  onOpenOffer: (offer: MerchantOffer) => void;
}

const placeOf = (label: string) => {
  const cut = label.lastIndexOf(',');
  return cut > 0 ? label.slice(0, cut).trim() : label;
};

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  offers,
  merchants,
  ratings,
  userPoint,
  locationLabel,
  isDetecting,
  locationError,
  selectedCategory,
  onSelectCategory,
  onUseMyLocation,
  onOpenReviews,
  onMessage,
  viewerMerchantId,
  onOpenOffer,
}) => {
  const ranked = useMemo(
    () =>
      selectedCategory
        ? rankCategory({ category: selectedCategory, offers, merchants, ratings, userPoint })
        : [],
    [selectedCategory, offers, merchants, ratings, userPoint]
  );

  // Per-category counts and the nearest post, for the category cards.
  const overview = useMemo(
    () =>
      new Map(
        MERCHANT_OFFER_CATEGORY_IDS.map((category) => {
          const posts = rankCategory({ category, offers, merchants, ratings, userPoint });
          const nearest = posts.reduce<(typeof posts)[number] | null>(
            (best, m) =>
              m.distanceKm !== null && (best === null || m.distanceKm < (best.distanceKm ?? Infinity))
                ? m
                : best,
            null
          );
          return [category, { count: posts.length, nearest }] as const;
        })
      ),
    [offers, merchants, ratings, userPoint]
  );

  const locationLine = isDetecting ? (
    <span className="inline-flex items-center gap-1.5">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting your location…
    </span>
  ) : userPoint && locationLabel ? (
    <span className="inline-flex items-center gap-1.5">
      <MapPin className="w-3.5 h-3.5" /> Ranked by distance from <strong>{placeOf(locationLabel)}</strong> and review ratings
    </span>
  ) : (
    <span>Ranked by review ratings — turn on your location to rank the closest first.</span>
  );

  return (
    <section className="space-y-6" aria-labelledby="categories-heading">
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2557] via-[#1E3A8A] to-[#047857] text-white p-6 sm:p-8 shadow-xl border border-amber-400/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-1 text-xs font-extrabold text-amber-300">
            <LayoutGrid className="w-3.5 h-3.5" /> Categories
          </div>
          <h2 id="categories-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {selectedCategory
              ? `${MERCHANT_CATEGORY_META[selectedCategory].emoji} ${MERCHANT_CATEGORY_META[selectedCategory].label}`
              : 'What do you need?'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100" data-testid="categories-location-line">
            {locationLine}
          </p>
          {locationError && !userPoint && <p className="text-xs font-bold text-amber-200">{locationError}</p>}
        </div>
        {!userPoint && !isDetecting && (
          <button
            type="button"
            onClick={onUseMyLocation}
            data-agent-id="categories-use-location-btn"
            data-testid="categories-use-location-btn"
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-5 py-3 shadow-lg shrink-0"
          >
            <LocateFixed className="w-4 h-4" /> Use my location
          </button>
        )}
      </div>

      {selectedCategory ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            data-agent-id="categories-back-btn"
            data-testid="categories-back-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:border-amber-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All categories
          </button>
          {ranked.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No postcards in {MERCHANT_CATEGORY_META[selectedCategory].label} yet.
            </p>
          ) : (
            <PostcardGrid
              as="ol"
              items={ranked}
              getKey={(match) => match.offer.id}
              resetKey={selectedCategory}
              testId="categories-ranked-list"
              ariaLabel={`${MERCHANT_CATEGORY_META[selectedCategory].label}, closest and best rated first`}
              itemTestId={(_, index) => `category-rank-${index + 1}`}
              renderItem={(match, index) => (
                <>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#0F2557] text-amber-300 font-extrabold">
                      #{index + 1}
                    </span>
                    {match.distanceKm !== null && (
                      <span className="tabular-nums">{formatDistance(match.distanceKm, match.isApproximate)}</span>
                    )}
                    {/* The compact card shows the rating below lg; the rank line repeats it on desktop. */}
                    <span className="hidden lg:inline-flex">
                      <RatingBadge summary={match.rating} />
                    </span>
                  </div>
                  <MerchantOfferPostcard
                    offer={match.offer}
                    idPrefix={`cat-${match.offer.id}`}
                    rating={match.rating}
                    compact
                    onOpen={onOpenOffer}
                    onOpenReviews={onOpenReviews}
                    onMessage={viewerMerchantId === match.offer.merchantId ? undefined : onMessage}
                  />
                </>
              )}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6" data-testid="categories-grid">
          {MERCHANT_CATEGORY_GROUPS.map((group) => (
            <section key={group.label} aria-label={group.label} className="space-y-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {group.label}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.categories.map((category) => {
                  const meta = MERCHANT_CATEGORY_META[category];
                  const { count, nearest } = overview.get(category) ?? { count: 0, nearest: null };
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => onSelectCategory(category)}
                      data-agent-id={`category-card-${category}`}
                      data-testid={`category-card-${category}`}
                      className="text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-sm transition-all group flex flex-col gap-1.5"
                    >
                      <span aria-hidden="true" className="text-3xl">
                        {meta.emoji}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600">
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {count === 0
                          ? 'No posts yet'
                          : `${count} post${count === 1 ? '' : 's'}`}
                        {nearest && nearest.distanceKm !== null
                          ? ` · nearest ${formatDistance(nearest.distanceKm, nearest.isApproximate)}`
                          : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
};
