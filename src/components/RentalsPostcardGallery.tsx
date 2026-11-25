import React, { useState } from 'react';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ShieldCheck,
  Zap,
  Mail,
  Send,
  PlusCircle,
  Stamp,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  CambodiaRentalListing,
  PostcardMessageSchema,
  RentalPostcardMessage,
} from '../types/contracts';
import { PostcardDialog } from './PostcardDialog';
import { AIRMAIL_STRIPE_BG } from './PostcardFrame';
import { PostcardGrid } from './PostcardGrid';
import { PriceBadge } from './PriceBadge';

interface RentalPostcardProps {
  rental: CambodiaRentalListing;
  /** Keeps test IDs unique when a listing also shows in the full-listing dialog. */
  idPrefix?: string;
  /**
   * A card in the 2-up grid: below lg (phones, tablets) the compact face — photo, title, price,
   * beds/baths and Message — and the full listing from lg up.
   */
  compact?: boolean;
  /** Tapping the photo opens the full listing. */
  onOpen?: () => void;
  onMessageAgent: () => void;
}

/** One rental listing card (full, or compact on smaller screens). */
const RentalPostcard: React.FC<RentalPostcardProps> = ({
  rental,
  idPrefix = rental.id,
  compact = false,
  onOpen,
  onMessageAgent,
}) => {
  // Classes that differ between the compact face (below lg) and the full listing.
  const wide = compact ? 'hidden lg:block' : 'block';
  const wideFlex = compact ? 'hidden lg:flex' : 'flex';
  const titleId = `rental-title-${idPrefix}`;

  const photo = (
    <span className="relative block">
      <img
        src={rental.imageUrl}
        alt={rental.title}
        loading="lazy"
        className="block w-full aspect-video object-cover"
      />
      <span
        className={`absolute flex flex-wrap gap-1.5 ${compact ? 'top-1.5 left-1.5 sm:top-3 sm:left-3' : 'top-3 left-3'}`}
      >
        <span
          className={`rounded-full bg-[#0F2557]/90 backdrop-blur-md text-amber-300 font-extrabold shadow-md ${
            compact ? 'px-1.5 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-[11px]' : 'px-3 py-1 text-[11px]'
          }`}
        >
          {compact ? (
            <>
              <span className="sr-only sm:not-sr-only">{rental.propertyType} • </span>
              {rental.city}
            </>
          ) : (
            `${rental.propertyType} • ${rental.city}`
          )}
        </span>
        <span
          className={`px-3 py-1 rounded-full bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-extrabold shadow-md ${
            compact ? 'hidden sm:inline' : ''
          }`}
        >
          ✓ {rental.badgeText}
        </span>
      </span>

      {/* Postcard Stamp Corner */}
      <span
        className={`absolute top-3 right-3 bg-amber-50 dark:bg-slate-900 border-2 border-dashed border-amber-600 px-2.5 py-1.5 rounded-lg shadow-md text-center ${
          compact ? 'hidden md:block' : 'block'
        }`}
      >
        <span className="block text-[9px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-amber-400">
          🇰🇭 POSTCARD STAMP
        </span>
        <span className="font-mono text-[10px] font-extrabold text-slate-900 dark:text-white">
          {rental.postcardStampCode}
        </span>
      </span>
    </span>
  );

  return (
    <article
      aria-labelledby={titleId}
      data-testid={`rental-postcard-${idPrefix}`}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between ${
        compact ? 'rounded-2xl sm:rounded-3xl' : 'rounded-3xl'
      }`}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open listing: ${rental.title}`}
          data-agent-id={`rental-open-btn-${idPrefix}`}
          data-testid={`rental-open-btn-${idPrefix}`}
          className="block w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-amber-400"
        >
          {photo}
        </button>
      ) : (
        photo
      )}

      {/* Card Body */}
      <div
        className={`flex-1 flex flex-col justify-between ${
          compact ? 'p-2.5 space-y-2 sm:p-4 lg:p-6 lg:space-y-4' : 'p-6 space-y-4'
        }`}
      >
        <div className={compact ? 'space-y-1.5 lg:space-y-3' : 'space-y-3'}>
          <div className="flex flex-wrap items-start justify-between gap-1.5 lg:gap-2">
            <div className="min-w-0">
              <h3
                id={titleId}
                className={`font-extrabold text-slate-900 dark:text-white ${
                  compact
                    ? 'text-xs leading-tight sm:text-sm line-clamp-2 lg:line-clamp-none lg:text-lg lg:leading-snug'
                    : 'text-lg leading-snug'
                }`}
              >
                {rental.title}
              </h3>
              <p className={`text-xs font-khmer text-amber-700 dark:text-amber-400 mt-0.5 ${wide}`}>
                {rental.khmerNeighborhood}
              </p>
            </div>
            <PriceBadge priceUsd={rental.priceUsdMonthly} suffix="/mo" idPrefix={`rental-${idPrefix}`} />
          </div>

          {/* Compact specs line (phones, tablets) */}
          {compact && (
            <p className="lg:hidden text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 truncate">
              {rental.bedrooms} bed · {rental.bathrooms} bath · {rental.areaSqm} m²
            </p>
          )}

          {/* Specs Row */}
          <div
            className={`flex-wrap items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-xl ${wideFlex}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-amber-600" /> {rental.bedrooms} Bed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-amber-600" /> {rental.bathrooms} Bath
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-amber-600" /> {rental.areaSqm} m²
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              {rental.fpcsGuaranteed ? 'FPCS 24h Ready' : 'Standard Lease'}
            </span>
          </div>

          {/* Sangkat & EDC Info */}
          <div className={`space-y-1 text-xs text-slate-600 dark:text-slate-400 ${wide}`}>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                <strong>Sangkat:</strong> {rental.sangkat}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                <strong>Utilities (EDC):</strong> {rental.edcRateKhr}
              </span>
            </div>
          </div>

          {/* Amenities Pills */}
          <div className={`flex-wrap gap-1.5 pt-1 ${wideFlex}`}>
            {rental.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Postcard Agent Footer */}
        <div
          className={`border-t border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
            compact ? 'pt-2 gap-2 lg:pt-4 lg:mt-2 lg:flex-row lg:items-center lg:gap-3' : 'pt-4 mt-2 sm:flex-row sm:items-center gap-3'
          }`}
        >
          <div className={`text-xs ${wide}`}>
            <span className="block font-extrabold text-slate-900 dark:text-white">
              🎐 Agent: {rental.agentName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {rental.agentAgency} • <span className="font-mono">{rental.agentTelegram}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onMessageAgent}
            data-agent-id={`open-postcard-modal-btn-${idPrefix}`}
            data-testid={`open-postcard-modal-btn-${idPrefix}`}
            aria-label={`Send Message Agent Postcard for ${rental.title}`}
            className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#B91C1C] to-[#0F2557] hover:opacity-95 text-white font-extrabold shadow-md transition-all ${
              compact ? 'gap-1.5 text-[11px] px-2 py-2 lg:gap-2 lg:text-xs lg:px-4 lg:py-2.5' : 'gap-2 text-xs px-4 py-2.5'
            }`}
          >
            <Mail className="w-4 h-4 text-amber-300 shrink-0" />
            {compact ? (
              <>
                <span className="lg:hidden">Message agent</span>
                <span className="hidden lg:inline">💌 Send Message Agent Postcard</span>
              </>
            ) : (
              '💌 Send Message Agent Postcard'
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

interface RentalsPostcardGalleryProps {
  rentals: CambodiaRentalListing[];
  sentPostcards: RentalPostcardMessage[];
  onSendPostcard: (msg: RentalPostcardMessage) => void;
}

export const RentalsPostcardGallery: React.FC<RentalsPostcardGalleryProps> = ({
  rentals,
  sentPostcards,
  onSendPostcard,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [activePostcardRental, setActivePostcardRental] =
    useState<CambodiaRentalListing | null>(null);

  // Postcard Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [telegramOrWhatsApp, setTelegramOrWhatsApp] = useState('');
  const [currentVisaType, setCurrentVisaType] = useState('Visa E (Ordinary)');
  const [moveInDate, setMoveInDate] = useState('2026-12-01');
  const [leaseDurationMonths, setLeaseDurationMonths] = useState(12);
  const [needsFpcsAndSangkat, setNeedsFpcsAndSangkat] = useState(true);
  const [message, setMessage] = useState(
    'Soursdey! I would love to schedule a viewing and confirm 24-hour FPCS registration & Sangkat Residence Certificate support for my stay.'
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [postcardSuccess, setPostcardSuccess] = useState(false);

  const [openedRental, setOpenedRental] = useState<CambodiaRentalListing | null>(null);

  const filteredRentals = rentals.filter(
    (r) => selectedCity === 'All' || r.city === selectedCity
  );

  const openComposer = (rental: CambodiaRentalListing) => {
    setActivePostcardRental(rental);
    setPostcardSuccess(false);
    setFormError(null);
  };

  const handleDispatchPostcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePostcardRental) return;
    setFormError(null);

    const parsed = PostcardMessageSchema.safeParse({
      senderName,
      senderEmail,
      telegramOrWhatsApp,
      currentVisaType,
      moveInDate,
      leaseDurationMonths: Number(leaseDurationMonths),
      needsFpcsAndSangkat,
      message,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Please check your postcard fields.');
      return;
    }

    const newPostcard: RentalPostcardMessage = {
      id: `PCARD-${Math.floor(100000 + Math.random() * 900000)}`,
      rentalId: activePostcardRental.id,
      rentalTitle: activePostcardRental.title,
      recipientAgent: `${activePostcardRental.agentName} (${activePostcardRental.agentTelegram})`,
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };

    onSendPostcard(newPostcard);
    setPostcardSuccess(true);
  };

  return (
    <section className="space-y-8" aria-label="Cambodia rentals gallery">
      {/* City Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['All', 'Phnom Penh', 'Siem Reap', 'Kampot', 'Sihanoukville', 'Koh Rong'].map(
            (city) => {
              const active = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  data-agent-id={`rental-city-pill-${city.toLowerCase().replace(/\s+/g, '-')}`}
                  data-testid={`rental-city-pill-${city.toLowerCase().replace(/\s+/g, '-')}`}
                  aria-pressed={active}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    active
                      ? 'bg-[#0F2557] text-amber-300 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  {city === 'All' ? '🇰🇭 All Cambodia Locations' : `📍 ${city}`}
                </button>
              );
            }
          )}
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Showing {filteredRentals.length} verified expat properties
        </span>
      </div>

      {/* Rentals: 2 per row on every screen, 3 rows at a time, then More */}
      <PostcardGrid
        items={filteredRentals}
        getKey={(rental) => rental.id}
        resetKey={selectedCity}
        testId="rentals-grid"
        ariaLabel="Rental postcards"
        noun="rentals"
        renderItem={(rental) => (
          <RentalPostcard
            rental={rental}
            compact
            onOpen={() => setOpenedRental(rental)}
            onMessageAgent={() => openComposer(rental)}
          />
        )}
      />

      {/* The full listing, opened from a compact card */}
      {openedRental && (
        <PostcardDialog
          titleId={`rental-title-open-${openedRental.id}`}
          testId="rental-dialog"
          closeTestId="close-rental-dialog-btn"
          closeLabel="Close listing"
          onClose={() => setOpenedRental(null)}
        >
          <RentalPostcard
            rental={openedRental}
            idPrefix={`open-${openedRental.id}`}
            onMessageAgent={() => {
              const rental = openedRental;
              setOpenedRental(null);
              openComposer(rental);
            }}
          />
        </PostcardDialog>
      )}

      {/* Recently Dispatched Cambodia Postcards Preview Wall */}
      {sentPostcards.length > 0 && (
        <div className="rounded-3xl bg-amber-50/80 dark:bg-slate-900 border-2 border-dashed border-amber-500/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Stamp className="w-5 h-5 text-rose-700 dark:text-amber-400" />
              Dispatched Cambodia Rental Postcards ({sentPostcards.length})
            </h3>
            <span className="text-xs text-slate-500">
              Synced with Superadmin Postcard Inbox
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sentPostcards.map((pc) => (
              <div
                key={pc.id}
                className="bg-[#FFFDF9] dark:bg-slate-800 rounded-2xl p-4 border-2 border-amber-600/40 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-4"
              >
                <div className="sm:col-span-7 sm:border-r border-dashed border-amber-500/40 pr-3 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-amber-300">
                    POSTCARD #{pc.id} • {pc.moveInDate} ({pc.leaseDurationMonths} mos)
                  </span>
                  <p className="text-xs italic text-slate-800 dark:text-slate-200">
                    “{pc.message}”
                  </p>
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    {pc.needsFpcsAndSangkat
                      ? '✓ Requested 24h FPCS & Sangkat Cert'
                      : 'Standard Lease Inquiry'}
                  </div>
                </div>
                <div className="sm:col-span-5 space-y-1 text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    TO: {pc.recipientAgent}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    RE: {pc.rentalTitle}
                  </div>
                  <div className="pt-1 text-[11px] text-slate-700 dark:text-slate-300">
                    FROM: <strong>{pc.senderName}</strong> ({pc.telegramOrWhatsApp})
                  </div>
                  <div className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                    Visa: {pc.currentVisaType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Cambodia Postcard Composer Modal */}
      {activePostcardRental && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActivePostcardRental(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="postcard-composer-title"
            className="w-full max-w-3xl bg-[#FFFDF7] dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-[#0F2557] dark:border-amber-500 overflow-hidden my-8"
          >
            {/* Airmail Striped Top Bar */}
            <div aria-hidden="true" className={`h-3 ${AIRMAIL_STRIPE_BG}`} />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Postcard Header & Stamp */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-dashed border-amber-600/40 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-700 dark:text-amber-400">
                    ✈️ PAR AVION • KINGDOM OF CAMBODIA EXPAT POSTCARD 🇰🇭
                  </span>
                  <h3
                    id="postcard-composer-title"
                    className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5"
                  >
                    Message Agent Postcard: {activePostcardRental.title}
                  </h3>
                  <p className="text-xs font-khmer text-slate-600 dark:text-slate-400">
                    {activePostcardRental.khmerNeighborhood} • {activePostcardRental.sangkat}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-24 rounded-xl bg-amber-100/90 dark:bg-slate-800 border-2 border-dashed border-amber-700 flex flex-col items-center justify-center p-2 text-center shadow-inner">
                    <span className="text-xl">🛕</span>
                    <span className="text-[9px] font-extrabold uppercase text-amber-900 dark:text-amber-300">
                      CAMBODIA
                    </span>
                    <span className="font-mono text-[9px] font-bold text-rose-700 dark:text-rose-400">
                      {activePostcardRental.postcardStampCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePostcardRental(null)}
                    data-agent-id="close-postcard-modal-btn"
                    data-testid="close-postcard-modal-btn"
                    aria-label="Close Postcard Composer"
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {postcardSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-200">
                    🇰🇭 Your Cambodia Rental Postcard Has Been Dispatched!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-lg mx-auto">
                    Delivered to <strong>{activePostcardRental.agentName}</strong> at{' '}
                    <strong>{activePostcardRental.agentAgency}</strong> (
                    {activePostcardRental.agentTelegram}). Your postcard is now visible on the Dispatched Postcards wall below!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActivePostcardRental(null)}
                    data-agent-id="done-postcard-modal-btn"
                    data-testid="done-postcard-modal-btn"
                    className="px-6 py-2.5 rounded-xl bg-[#0F2557] text-amber-300 text-xs font-extrabold"
                  >
                    Return to Rentals Gallery
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleDispatchPostcard}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  {/* Left Side of Postcard: Handwritten Message & Lease Dates */}
                  <div className="md:col-span-7 md:border-r-2 border-dashed border-amber-600/40 md:pr-6 space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        ✍️ Your Note to {activePostcardRental.agentName} *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        data-agent-id="postcard-message-textarea"
                        data-testid="postcard-message-textarea"
                        className="w-full p-3 rounded-xl bg-amber-50/60 dark:bg-slate-800 border border-amber-400/60 text-xs font-medium text-slate-900 dark:text-white leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Preferred Move-In Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={moveInDate}
                          onChange={(e) => setMoveInDate(e.target.value)}
                          data-agent-id="postcard-movein-input"
                          data-testid="postcard-movein-input"
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Lease Duration (Months)
                        </label>
                        <select
                          value={leaseDurationMonths}
                          onChange={(e) => setLeaseDurationMonths(Number(e.target.value))}
                          data-agent-id="postcard-duration-select"
                          data-testid="postcard-duration-select"
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                        >
                          <option value={3}>3 Months</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>12 Months (1 Year)</option>
                          <option value={24}>24 Months (2 Years)</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsFpcsAndSangkat}
                        onChange={(e) => setNeedsFpcsAndSangkat(e.target.checked)}
                        data-agent-id="postcard-fpcs-checkbox"
                        data-testid="postcard-fpcs-checkbox"
                        className="rounded text-emerald-600"
                      />
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                        📲 Require 24-Hour FPCS App Registration + Sangkat Residence Certificate Help
                      </span>
                    </label>
                  </div>

                  {/* Right Side of Postcard: Recipient Agent & Sender Details */}
                  <div className="md:col-span-5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-b-2 border-slate-300 dark:border-slate-700 text-xs space-y-0.5">
                        <div className="text-[10px] font-extrabold uppercase text-slate-400">
                          RECIPIENT AGENT ADDRESS
                        </div>
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {activePostcardRental.agentName} • {activePostcardRental.agentAgency}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {activePostcardRental.sangkat}, {activePostcardRental.city}
                        </div>
                        <div className="font-mono text-amber-700 dark:text-amber-300">
                          Telegram: {activePostcardRental.agentTelegram}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="e.g., David Thorne"
                          data-agent-id="postcard-sender-name"
                          data-testid="postcard-sender-name"
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Your Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          placeholder="you@example.com"
                          data-agent-id="postcard-sender-email"
                          data-testid="postcard-sender-email"
                          className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Telegram / WhatsApp *
                          </label>
                          <input
                            type="text"
                            required
                            value={telegramOrWhatsApp}
                            onChange={(e) => setTelegramOrWhatsApp(e.target.value)}
                            placeholder="@yourhandle"
                            data-agent-id="postcard-sender-telegram"
                            data-testid="postcard-sender-telegram"
                            className="w-full h-9 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Your Cambodia Visa
                          </label>
                          <select
                            value={currentVisaType}
                            onChange={(e) => setCurrentVisaType(e.target.value)}
                            data-agent-id="postcard-visa-select"
                            data-testid="postcard-visa-select"
                            className="w-full h-9 px-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                          >
                            <option value="Visa E (Ordinary)">Visa E (Ordinary)</option>
                            <option value="EB (Business/Work)">EB (Business/Work)</option>
                            <option value="ER (Retirement)">ER (Retirement)</option>
                            <option value="CM2H (10-Yr Golden Visa)">CM2H (10-Yr Golden)</option>
                            <option value="Tourist (T) / Arriving Soon">Arriving Soon</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg">
                        {formError}
                      </div>
                    )}

                    <button
                      type="submit"
                      data-agent-id="submit-postcard-to-agent-btn"
                      data-testid="submit-postcard-to-agent-btn"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B91C1C] to-[#0F2557] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
                    >
                      <Send className="w-4 h-4 text-amber-300" />
                      Stamp &amp; Mail Postcard to Agent
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Airmail Striped Bottom Bar */}
            <div aria-hidden="true" className={`h-3 ${AIRMAIL_STRIPE_BG}`} />
          </div>
        </div>
      )}
    </section>
  );
};
