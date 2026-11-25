import React, { useState } from 'react';
import { Inbox, PlusCircle, Store } from 'lucide-react';
import { MERCHANT_CATEGORY_GROUPS, MERCHANT_CATEGORY_META } from '../data/cambodiaData';
import {
  MERCHANT_OFFER_CITIES,
  MerchantOffer,
  MerchantOfferCategory,
  MerchantOfferCity,
} from '../types/contracts';
import { NO_RATING, RatingSummary } from '../lib/reviews';
import { MerchantOfferPostcard } from './MerchantOfferPostcard';
import { PostcardGrid } from './PostcardGrid';
import { SharedPostcardSpotlight } from './SharedPostcardSpotlight';

interface MerchantOffersBoardProps {
  offers: MerchantOffer[];
  /** Merchants post from the Merchant Desk in the Admin Panel (signing in first if needed). */
  onOpenMerchantDesk: () => void;
  /** Offer opened from a shared link (?offer=OFR-...) or picked in search, pinned above the board. */
  sharedOfferId: string | null;
  spotlightSource: 'link' | 'search';
  onDismissSharedOffer: () => void;
  ratings: Map<string, RatingSummary>;
  onOpenReviews: (merchantId: string) => void;
  onMessage: (offer: MerchantOffer) => void;
  /** The signed-in merchant, who shouldn't message their own postcards. */
  viewerMerchantId: string | null;
  /** Opens the full postcard from a compact grid card. */
  onOpenOffer: (offer: MerchantOffer) => void;
}

export const MerchantOffersBoard: React.FC<MerchantOffersBoardProps> = ({
  offers,
  onOpenMerchantDesk,
  sharedOfferId,
  spotlightSource,
  onDismissSharedOffer,
  ratings,
  onOpenReviews,
  onMessage,
  viewerMerchantId,
  onOpenOffer,
}) => {
  const postcardActions = (offer: MerchantOffer) => ({
    rating: ratings.get(offer.merchantId) ?? NO_RATING,
    onOpenReviews,
    onMessage: viewerMerchantId === offer.merchantId ? undefined : onMessage,
  });
  const [selectedCategory, setSelectedCategory] = useState<'all' | MerchantOfferCategory>('all');
  const [selectedCity, setSelectedCity] = useState<'All' | MerchantOfferCity>('All');

  const sharedOffer = sharedOfferId
    ? offers.find((offer) => offer.id === sharedOfferId) ?? null
    : null;

  const filteredOffers = offers.filter(
    (offer) =>
      (selectedCategory === 'all' || offer.category === selectedCategory) &&
      (selectedCity === 'All' || offer.city === selectedCity)
  );
  // The shared postcard is pinned above, so don't repeat it in the grid.
  const boardOffers = sharedOffer
    ? filteredOffers.filter((offer) => offer.id !== sharedOffer.id)
    : filteredOffers;

  return (
    <section className="space-y-8" aria-labelledby="merchant-offers-heading">
      {/* Pinned postcard from a shared link (or picked in search) */}
      {sharedOfferId && (
        <SharedPostcardSpotlight
          idBase="shared-offer"
          source={spotlightSource}
          heading={sharedOffer ? `A postcard from ${sharedOffer.businessName}` : 'This offer is no longer available'}
          missingHint={sharedOffer ? undefined : 'The merchant may have ended it — browse the latest offers below.'}
          dismissLabel="Dismiss shared offer"
          onDismiss={onDismissSharedOffer}
          scrollKey={sharedOfferId}
        >
          {sharedOffer && (
            <MerchantOfferPostcard
              offer={sharedOffer}
              idPrefix={`shared-${sharedOffer.id}`}
              {...postcardActions(sharedOffer)}
            />
          )}
        </SharedPostcardSpotlight>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#7F1D1D] via-[#0F2557] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-xl border border-amber-400/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-1 text-xs font-extrabold text-amber-300">
            <Store className="w-3.5 h-3.5" />
            Local Merchants • Shareable Offer Postcards
          </div>
          <h2
            id="merchant-offers-heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          >
            Merchant Offer Postcards 🇰🇭📮
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-3xl">
            Visa services, licences, rental accommodation, SIM cards, Wi-Fi, restaurants, massage,
            motorbike hire — everything a traveller needs, posted by local merchants. Share any
            postcard to Facebook, X, LinkedIn, WhatsApp, Telegram or email:{' '}
            <strong className="text-amber-300">every share links straight back here.</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenMerchantDesk}
          data-agent-id="open-merchant-desk-btn"
          data-testid="open-merchant-desk-btn"
          aria-label="Post a merchant offer postcard from the Merchant Desk"
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-5 py-3.5 shadow-lg transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          📮 Post Your Offer (Merchant Desk)
        </button>
      </div>

      {/* Category & City Filters (28 categories → grouped dropdown) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="merchant-category-filter"
              className="text-xs font-bold text-slate-600 dark:text-slate-400"
            >
              Category:
            </label>
            <select
              id="merchant-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'all' | MerchantOfferCategory)}
              data-agent-id="merchant-category-filter-select"
              data-testid="merchant-category-filter-select"
              className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="all">🇰🇭 All offers</option>
              {MERCHANT_CATEGORY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.categories.map((category) => (
                    <option key={category} value={category}>
                      {MERCHANT_CATEGORY_META[category].emoji} {MERCHANT_CATEGORY_META[category].label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="merchant-city-filter"
              className="text-xs font-bold text-slate-600 dark:text-slate-400"
            >
              City:
            </label>
            <select
              id="merchant-city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as 'All' | MerchantOfferCity)}
              data-agent-id="merchant-city-filter-select"
              data-testid="merchant-city-filter-select"
              className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="All">All Cambodia Cities</option>
              {MERCHANT_OFFER_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">
          Showing {filteredOffers.length} merchant offer{filteredOffers.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Postcards: 2 per row on every screen, 3 rows at a time, then More */}
      {filteredOffers.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-amber-500/50 bg-white/70 dark:bg-slate-900 p-8 text-center space-y-3">
          <Inbox className="w-10 h-10 text-amber-600 mx-auto" />
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            No merchant postcards here yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try another category or city — or be the first merchant to post one.
          </p>
          <button
            type="button"
            onClick={onOpenMerchantDesk}
            data-agent-id="empty-state-post-offer-btn"
            data-testid="empty-state-post-offer-btn"
            className="px-5 py-2.5 rounded-xl bg-[#0F2557] text-amber-300 text-xs font-extrabold"
          >
            📮 Post Your Offer
          </button>
        </div>
      ) : (
        <PostcardGrid
          items={boardOffers}
          getKey={(offer) => offer.id}
          resetKey={`${selectedCategory}|${selectedCity}|${sharedOffer?.id ?? ''}`}
          testId="merchant-offers-grid"
          ariaLabel="Merchant offer postcards"
          renderItem={(offer) => (
            <MerchantOfferPostcard offer={offer} compact onOpen={onOpenOffer} {...postcardActions(offer)} />
          )}
        />
      )}
    </section>
  );
};
