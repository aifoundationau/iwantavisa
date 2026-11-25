import React, { useEffect, useState } from 'react';
import { CheckCircle2, Inbox, Loader2, LocateFixed, MapPin, Store, Trash2 } from 'lucide-react';
import {
  MERCHANT_OFFER_CITIES,
  MerchantLocationFormSchema,
  MerchantMessage,
  MerchantOffer,
  MerchantOfferCity,
  MerchantOfferContent,
  MerchantProfile,
} from '../types/contracts';
import { formatAccuracy, GeoStatus, MERCHANT_SUGGEST_RADIUS_KM } from '../lib/geo';
import { MerchantLocationUpdate } from '../lib/merchants';
import { conversationThread, listConversations } from '../lib/messages';
import { RatingSummary } from '../lib/reviews';
import { ConversationView } from './ConversationView';
import { MerchantOfferComposer } from './MerchantOfferComposer';
import { MerchantOfferPostcard } from './MerchantOfferPostcard';
import { PostcardGrid } from './PostcardGrid';
import { RatingBadge } from './StarRating';

interface MerchantDeskProps {
  /** null until someone signs in as a merchant. */
  merchant: MerchantProfile | null;
  /** The signed-in merchant's own postcards. */
  offers: MerchantOffer[];
  /** Messages in this merchant's conversations. */
  messages: MerchantMessage[];
  rating: RatingSummary;
  geoStatus: GeoStatus;
  onRequestMerchantSignIn: () => void;
  onDetectLocation: () => void;
  onSaveLocation: (update: MerchantLocationUpdate) => void;
  onPostOffer: (content: MerchantOfferContent) => MerchantOffer;
  onDeleteOffer: (offerId: string) => void;
  onReply: (userId: string, body: string) => void;
  onMarkRead: (userId: string) => void;
  /** Opens the full postcard from a compact grid card. */
  onOpenOffer?: (offer: MerchantOffer) => void;
}

const MerchantInbox: React.FC<{
  merchant: MerchantProfile;
  messages: MerchantMessage[];
  onReply: (userId: string, body: string) => void;
  onMarkRead: (userId: string) => void;
}> = ({ merchant, messages, onReply, onMarkRead }) => {
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const conversations = listConversations(messages, { role: 'merchant', merchantId: merchant.id });
  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const openHasUnread = conversations.some((c) => c.userId === openUserId && c.unread > 0);

  // Opening a conversation marks the traveller's messages as read.
  useEffect(() => {
    if (openUserId && openHasUnread) onMarkRead(openUserId);
  }, [openUserId, openHasUnread, onMarkRead]);

  return (
    <div
      aria-labelledby="merchant-inbox-heading"
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg space-y-3"
    >
      <h4 id="merchant-inbox-heading" className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
        <Inbox className="w-5 h-5 text-amber-600" /> Inbox
        {unread > 0 && (
          <span data-testid="merchant-inbox-unread" className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white">
            {unread} new
          </span>
        )}
      </h4>
      {conversations.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No messages yet. Travellers can message you from any of your postcards.
        </p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conversation) => {
            const isOpen = openUserId === conversation.userId;
            return (
              <li
                key={conversation.userId}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenUserId(isOpen ? null : conversation.userId)}
                  aria-expanded={isOpen}
                  data-testid={`merchant-inbox-open-${conversation.userId}`}
                  className="w-full text-left p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">{conversation.userName}</div>
                    {conversation.offerHeadline && (
                      <div className="text-[11px] text-slate-500 truncate">📮 {conversation.offerHeadline}</div>
                    )}
                    <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {conversation.lastMessage.from === 'merchant' ? 'You: ' : ''}
                      {conversation.lastMessage.body}
                    </div>
                  </div>
                  {conversation.unread > 0 && (
                    <span className="shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
                      {conversation.unread} new
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3">
                    <ConversationView
                      thread={conversationThread(messages, merchant.id, conversation.userId)}
                      viewerRole="merchant"
                      counterpartName={conversation.userName}
                      onSend={(body) => onReply(conversation.userId, body)}
                      idPrefix={`desk-chat-${conversation.userId}`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const MerchantDesk: React.FC<MerchantDeskProps> = ({ merchant, onRequestMerchantSignIn, ...rest }) => {
  if (!merchant) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg text-center space-y-3">
        <Store className="w-10 h-10 text-amber-600 mx-auto" />
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Merchant Desk</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Register your business (or sign in) to post offer postcards, auto-detect your business
          location, and keep every postcard up to date when you adjust it.
        </p>
        <button
          type="button"
          onClick={onRequestMerchantSignIn}
          data-agent-id="merchant-desk-sign-in-btn"
          data-testid="merchant-desk-sign-in-btn"
          className="px-6 py-3 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 font-extrabold text-xs shadow-lg"
        >
          Register or sign in as a merchant
        </button>
      </div>
    );
  }
  return <SignedInMerchantDesk key={merchant.id} merchant={merchant} {...rest} />;
};

type SignedInMerchantDeskProps = Omit<MerchantDeskProps, 'merchant' | 'onRequestMerchantSignIn'> & {
  merchant: MerchantProfile;
};

const SignedInMerchantDesk: React.FC<SignedInMerchantDeskProps> = ({
  merchant,
  offers,
  messages,
  rating,
  geoStatus,
  onDetectLocation,
  onSaveLocation,
  onPostOffer,
  onDeleteOffer,
  onReply,
  onMarkRead,
  onOpenOffer,
}) => {
  const [formCity, setFormCity] = useState<MerchantOfferCity>(merchant.city);
  const [formAddress, setFormAddress] = useState(merchant.addressLine);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  // Re-sync the form when the saved location changes.
  useEffect(() => {
    setFormCity(merchant.city);
    setFormAddress(merchant.addressLine);
  }, [merchant.city, merchant.addressLine]);

  const detected = geoStatus.state === 'detected' ? geoStatus.location : null;
  const suggestion =
    detected && detected.nearestMerchantCity.distanceKm <= MERCHANT_SUGGEST_RADIUS_KM
      ? detected.nearestMerchantCity
      : null;
  const streetLooksStale =
    formCity !== merchant.city && formAddress.trim() === merchant.addressLine;
  const postcardCount = offers.length;

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setLocationError(null);
    setSavedNotice(null);

    const parsed = MerchantLocationFormSchema.safeParse({ city: formCity, addressLine: formAddress });
    if (!parsed.success) {
      setLocationError(parsed.error.issues[0]?.message || 'Please check your location.');
      return;
    }

    const usesDetectedCity = Boolean(detected && suggestion && suggestion.city === parsed.data.city);
    onSaveLocation({
      city: parsed.data.city,
      addressLine: parsed.data.addressLine,
      locationSource: usesDetectedCity ? 'auto-detected' : 'manual',
      ...(usesDetectedCity && detected
        ? { geo: { lat: detected.lat, lng: detected.lng, accuracyM: detected.accuracyM } }
        : {}),
    });
    setSavedNotice(
      `Saved — ${postcardCount} postcard${postcardCount === 1 ? '' : 's'} now show ${parsed.data.addressLine}, ${parsed.data.city}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Merchant identity */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
            🏪 Merchant Desk • signed in (demo)
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {merchant.businessName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{merchant.contact}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>
            {postcardCount} live postcard{postcardCount === 1 ? '' : 's'}
          </span>
          <span data-testid="merchant-desk-rating">
            <RatingBadge summary={rating} />
          </span>
        </div>
      </div>

      <MerchantInbox merchant={merchant} messages={messages} onReply={onReply} onMarkRead={onMarkRead} />

      {/* Business location: auto-detected, then adjustable */}
      <form
        onSubmit={handleSaveLocation}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg space-y-4"
        aria-labelledby="merchant-location-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h4
              id="merchant-location-heading"
              className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2"
            >
              <MapPin className="w-5 h-5 text-rose-600" />
              Business Location
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shown on all {postcardCount} of your postcards:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {merchant.addressLine}, {merchant.city}
              </strong>{' '}
              <span className="whitespace-nowrap">
                ({merchant.locationSource === 'auto-detected' ? '📍 auto-detected' : '✍️ set manually'})
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={geoStatus.state === 'detecting'}
            data-agent-id="merchant-redetect-location-btn"
            data-testid="merchant-redetect-location-btn"
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1.5 disabled:opacity-50"
          >
            {geoStatus.state === 'detecting' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5" />
            )}
            {geoStatus.state === 'idle' ? 'Detect my location' : 'Re-detect'}
          </button>
        </div>

        {/* Detection result */}
        <div aria-live="polite" className="text-xs">
          {geoStatus.state === 'detecting' && (
            <p className="text-slate-600 dark:text-slate-400">Detecting your location…</p>
          )}
          {geoStatus.state === 'error' && (
            <p className="font-bold text-rose-700 dark:text-rose-300">{geoStatus.message}</p>
          )}
          {detected && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <p className="text-emerald-950 dark:text-emerald-200">
                📍 Auto-detected:{' '}
                <strong>
                  {detected.placeLabel}, {detected.regionLabel}
                </strong>{' '}
                <span className="text-emerald-800/80 dark:text-emerald-300/80">
                  ({formatAccuracy(detected.accuracyM)})
                </span>
              </p>
              {suggestion ? (
                suggestion.city === formCity ? (
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {suggestion.city} is selected below.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormCity(suggestion.city)}
                    data-agent-id="merchant-use-detected-city-btn"
                    data-testid="merchant-use-detected-city-btn"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-extrabold"
                  >
                    Use {suggestion.city} ({Math.round(suggestion.distanceKm)} km away)
                  </button>
                )
              ) : (
                <p className="text-emerald-900 dark:text-emerald-200">
                  You're {Math.round(detected.nearestMerchantCity.distanceKm).toLocaleString()} km from
                  the nearest postcard city ({detected.nearestMerchantCity.city}) — set your business
                  city below.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Adjust */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="merchant-location-city"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              City *
            </label>
            <select
              id="merchant-location-city"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value as MerchantOfferCity)}
              data-agent-id="merchant-location-city-select"
              data-testid="merchant-location-city-select"
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {MERCHANT_OFFER_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="merchant-location-address"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Street / Area / Landmark *
            </label>
            <input
              id="merchant-location-address"
              type="text"
              required
              maxLength={100}
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              data-agent-id="merchant-location-address-input"
              data-testid="merchant-location-address-input"
              aria-describedby={streetLooksStale ? 'merchant-location-address-hint' : undefined}
              className={`w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold text-slate-900 dark:text-white ${
                streetLooksStale
                  ? 'border-amber-500 ring-2 ring-amber-400/50'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {streetLooksStale && (
              <p
                id="merchant-location-address-hint"
                className="mt-1 text-[11px] font-bold text-amber-700 dark:text-amber-400"
              >
                This is your {merchant.city} street — update it for {formCity}.
              </p>
            )}
          </div>
        </div>

        {locationError && (
          <div role="alert" className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 p-2 rounded-lg">
            {locationError}
          </div>
        )}
        {savedNotice && (
          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {savedNotice}
          </div>
        )}

        <button
          type="submit"
          data-agent-id="merchant-save-location-btn"
          data-testid="merchant-save-location-btn"
          className="px-6 py-3 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 font-extrabold text-xs shadow-lg"
        >
          Save location &amp; update {postcardCount} postcard{postcardCount === 1 ? '' : 's'}
        </button>
      </form>

      <MerchantOfferComposer
        merchant={merchant}
        defaultCategory={offers[0]?.category ?? ''}
        onPost={onPostOffer}
      />

      {/* The merchant's live postcards */}
      <div className="space-y-4">
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
          Your Live Postcards ({postcardCount})
        </h4>
        {postcardCount === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No postcards yet — post your first offer above.
          </p>
        ) : (
          <PostcardGrid
            items={offers}
            getKey={(offer) => offer.id}
            testId="merchant-desk-postcards"
            ariaLabel="Your live postcards"
            renderItem={(offer) => (
              <>
                <MerchantOfferPostcard
                  offer={offer}
                  idPrefix={`desk-${offer.id}`}
                  rating={rating}
                  compact
                  onOpen={onOpenOffer}
                />
                <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
                  {confirmingDeleteId === offer.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteOffer(offer.id);
                          setConfirmingDeleteId(null);
                        }}
                        data-agent-id={`merchant-confirm-delete-offer-${offer.id}`}
                        data-testid={`merchant-confirm-delete-offer-${offer.id}`}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
                      >
                        ✓ Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        data-agent-id={`merchant-cancel-delete-offer-${offer.id}`}
                        data-testid={`merchant-cancel-delete-offer-${offer.id}`}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(offer.id)}
                      data-agent-id={`merchant-delete-offer-${offer.id}`}
                      data-testid={`merchant-delete-offer-${offer.id}`}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};
