import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { MERCHANT_CATEGORY_META } from '../data/cambodiaData';
import { MerchantOffer, MerchantProfile } from '../types/contracts';
import { formatDistance, LatLng } from '../lib/geo';
import { RatingSummary } from '../lib/reviews';
import { searchNeeds } from '../lib/search';
import { RatingBadge } from './StarRating';

interface NeedSearchBarProps {
  offers: MerchantOffer[];
  merchants: MerchantProfile[];
  ratings: Map<string, RatingSummary>;
  /** Where distances are measured from (detected, or the person's registered location). */
  userPoint: LatLng | null;
  locationLabel: string | null;
  isDetecting: boolean;
  locationError: string | null;
  onUseMyLocation: () => void;
  onOpenOffer: (offerId: string) => void;
}

const QUICK_NEEDS = [
  'SIM card',
  'Taxi',
  'Money exchange',
  'Food',
  'Hotel',
  'Massage',
  'Motorbike',
  'Pharmacy',
  'Laundry',
  'Visa',
  'Tour',
];
const MAX_RESULTS = 12;

// "Siem Reap, Cambodia 🇰🇭" → "Siem Reap"
const placeOf = (label: string) => {
  const cut = label.lastIndexOf(',');
  return cut > 0 ? label.slice(0, cut).trim() : label;
};

export const NeedSearchBar: React.FC<NeedSearchBarProps> = ({
  offers,
  merchants,
  ratings,
  userPoint,
  locationLabel,
  isDetecting,
  locationError,
  onUseMyLocation,
  onOpenOffer,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(
    () => searchNeeds({ query, offers, merchants, ratings, userPoint }),
    [query, offers, merchants, ratings, userPoint]
  );
  const results = matches.slice(0, MAX_RESULTS);
  const hasQuery = query.trim().length > 0;

  // Close when clicking anywhere outside the search area.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen]);

  const choose = (offerId: string) => {
    setIsOpen(false);
    onOpenOffer(offerId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[Math.min(activeIndex, results.length - 1)].offer.id);
    }
  };

  const optionId = (index: number) => `need-search-option-${index}`;

  return (
    <div ref={containerRef} className="relative z-20" data-testid="need-search">
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/70 shadow-sm">
        <div className="relative flex-1 min-w-0">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label="Search for what you need near you"
            aria-expanded={isOpen && hasQuery && results.length > 0}
            aria-controls="need-search-results"
            aria-autocomplete="list"
            aria-activedescendant={isOpen && results.length ? optionId(activeIndex) : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="What do you need? SIM card, massage, motorbike, visa…"
            data-agent-id="need-search-input"
            data-testid="need-search-input"
            className="w-full h-9 pl-9 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onUseMyLocation}
          disabled={isDetecting}
          title={locationLabel ? 'Distances are measured from here — click to update' : 'Use my location to rank by distance'}
          aria-label={locationLabel ? `Your location: ${locationLabel}. Update location` : 'Use my location'}
          data-agent-id="need-search-location-btn"
          data-testid="need-search-location-btn"
          className={`h-9 px-2.5 sm:px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition-colors disabled:opacity-60 ${
            userPoint
              ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
              : 'bg-[#0F2557] text-amber-300'
          }`}
        >
          {isDetecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : userPoint ? (
            <MapPin className="w-4 h-4" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
          {/* lg–xl: the search shares the top bar, so the button is just the pin (label in the tooltip) */}
          <span className="hidden sm:inline lg:hidden 2xl:inline truncate max-w-[9rem] 2xl:max-w-[12rem]">
            {isDetecting ? 'Detecting…' : locationLabel ? placeOf(locationLabel) : 'Use my location'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          data-testid="need-search-panel"
          className="absolute inset-x-0 mt-2 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-2xl p-3 max-h-[60vh] overflow-y-auto overscroll-contain"
        >
          {!hasQuery ? (
            <div className="space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Popular needs
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_NEEDS.map((need) => (
                  <button
                    key={need}
                    type="button"
                    onClick={() => {
                      setQuery(need);
                      setActiveIndex(0);
                      inputRef.current?.focus();
                    }}
                    data-testid={`need-search-quick-${need.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
                  >
                    {need}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 p-2" data-testid="need-search-empty">
              No merchants match “{query.trim()}” yet — try another word, like “SIM”, “food” or “tour”.
            </p>
          ) : (
            <>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1 pb-2" data-testid="need-search-summary">
                {matches.length} merchant offer{matches.length === 1 ? '' : 's'} ·{' '}
                {userPoint && locationLabel
                  ? `ranked by distance from ${placeOf(locationLabel)}, service match and reviews`
                  : 'ranked by service match and reviews — use your location to rank by distance too'}
              </p>
              <ul id="need-search-results" role="listbox" aria-label="Matching merchants" className="space-y-1">
                {results.map((match, index) => {
                  const { offer } = match;
                  const meta = MERCHANT_CATEGORY_META[offer.category];
                  const active = index === activeIndex;
                  return (
                    <li
                      key={offer.id}
                      id={optionId(index)}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(offer.id)}
                      data-testid={`need-search-result-${offer.id}`}
                      className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer ${
                        active ? 'bg-amber-500/15' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span aria-hidden="true" className="text-2xl leading-none mt-0.5">
                        {meta.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {offer.businessName}
                          </span>
                          {index === 0 && (
                            <span className="shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                              Top match
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 truncate">{offer.headline}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                          <span className="font-extrabold text-rose-700 dark:text-rose-300">{offer.dealBadge}</span>
                          <RatingBadge summary={match.rating} compact />
                          <span className="text-slate-500 dark:text-slate-400 truncate">
                            {offer.addressLine}, {offer.city}
                          </span>
                        </div>
                      </div>
                      {match.distanceKm !== null && (
                        <span className="shrink-0 text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {formatDistance(match.distanceKm, match.isApproximate)}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {locationError && !userPoint && (
            <p className="mt-2 px-1 text-[11px] font-bold text-rose-700 dark:text-rose-300">{locationError}</p>
          )}
        </div>
      )}
    </div>
  );
};
