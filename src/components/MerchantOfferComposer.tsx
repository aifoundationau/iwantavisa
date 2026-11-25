import React, { useState } from 'react';
import { MapPin, Phone, Send } from 'lucide-react';
import {
  MERCHANT_CATEGORY_GROUPS,
  MERCHANT_CATEGORY_META,
  MERCHANT_CITY_STAMP_CODES,
} from '../data/cambodiaData';
import {
  MerchantOffer,
  MerchantOfferCategory,
  MerchantOfferContent,
  MerchantOfferContentSchema,
  MerchantProfile,
} from '../types/contracts';
import { MerchantOfferPostcard } from './MerchantOfferPostcard';
import { AIRMAIL_STRIPE_CLASS } from './PostcardFrame';
import { ImageUploadField } from './ImageUploadField';

interface MerchantOfferComposerProps {
  merchant: MerchantProfile;
  defaultCategory: MerchantOfferCategory | '';
  /** Creates the offer from the postcard content + merchant profile and returns it. */
  onPost: (content: MerchantOfferContent) => MerchantOffer;
}

const LABEL_CLASS = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';
const INPUT_CLASS =
  'w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white';

export const MerchantOfferComposer: React.FC<MerchantOfferComposerProps> = ({
  merchant,
  defaultCategory,
  onPost,
}) => {
  const [category, setCategory] = useState<MerchantOfferCategory | ''>(defaultCategory);
  const [headline, setHeadline] = useState('');
  const [dealBadge, setDealBadge] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkedInPulseUrl, setLinkedInPulseUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [postedOffer, setPostedOffer] = useState<MerchantOffer | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = MerchantOfferContentSchema.safeParse({
      category,
      headline,
      dealBadge,
      message,
      imageUrl,
      linkedInPulseUrl,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Please check your postcard fields.');
      return;
    }

    setPostedOffer(onPost(parsed.data));
    setHeadline('');
    setDealBadge('');
    setMessage('');
    setImageUrl('');
    setLinkedInPulseUrl('');
  };

  return (
    <div className="bg-[#FFFDF7] dark:bg-slate-900 rounded-3xl border-4 border-[#0F2557] dark:border-amber-500 shadow-lg overflow-hidden">
      <div aria-hidden="true" className={AIRMAIL_STRIPE_CLASS} />

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-dashed border-amber-600/40 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-700 dark:text-amber-400">
              ✈️ PAR AVION • MERCHANT OFFER POSTCARD 🇰🇭
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {postedOffer ? 'Your offer postcard is live! 📮' : 'Post a New Offer Postcard'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {postedOffer
                ? 'Share it with travellers — every link opens your postcard back on I Want A Visa.'
                : 'Write the message side; we address it from your business and stamp it onto the Merchant Offers board.'}
            </p>
          </div>
          {!postedOffer && (
            <div
              aria-hidden="true"
              className="w-16 h-20 rounded-xl bg-amber-100/90 dark:bg-slate-800 border-2 border-dashed border-amber-700 flex flex-col items-center justify-center p-1.5 text-center shadow-inner"
            >
              <span className="text-xl">{category ? MERCHANT_CATEGORY_META[category].emoji : '📮'}</span>
              <span className="text-[8px] font-extrabold uppercase text-amber-900 dark:text-amber-300">
                Cambodia
              </span>
              <span className="font-mono text-[8px] font-bold text-rose-700 dark:text-rose-400">
                KH-{MERCHANT_CITY_STAMP_CODES[merchant.city]}
              </span>
            </div>
          )}
        </div>

        {postedOffer ? (
          <div className="space-y-5">
            <div className="max-w-xl mx-auto">
              <MerchantOfferPostcard offer={postedOffer} idPrefix={`preview-${postedOffer.id}`} />
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setPostedOffer(null);
                  setFormError(null);
                }}
                data-agent-id="post-another-offer-btn"
                data-testid="post-another-offer-btn"
                className="px-6 py-2.5 rounded-xl bg-[#0F2557] text-amber-300 text-xs font-extrabold"
              >
                Post Another Offer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Message side */}
            <div className="md:col-span-7 md:border-r-2 border-dashed border-amber-600/40 md:pr-6 space-y-4">
              <div>
                <label htmlFor="merchant-offer-headline" className={LABEL_CLASS}>
                  Offer Headline *
                </label>
                <input
                  id="merchant-offer-headline"
                  type="text"
                  required
                  maxLength={100}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Fish Amok Set Lunch + Iced Palm Sugar Coffee"
                  data-agent-id="merchant-offer-headline-input"
                  data-testid="merchant-offer-headline-input"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="merchant-offer-deal" className={LABEL_CLASS}>
                  Deal Badge *{' '}
                  <span className="font-normal text-slate-500">(the sticker on your postcard)</span>
                </label>
                <input
                  id="merchant-offer-deal"
                  type="text"
                  required
                  maxLength={24}
                  value={dealBadge}
                  onChange={(e) => setDealBadge(e.target.value)}
                  placeholder="e.g., 20% OFF • FREE SIM • $7/DAY"
                  data-agent-id="merchant-offer-deal-input"
                  data-testid="merchant-offer-deal-input"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="merchant-offer-message" className={LABEL_CLASS}>
                  ✍️ Postcard Message *
                </label>
                <textarea
                  id="merchant-offer-message"
                  rows={4}
                  required
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell travellers what they get, how to redeem it, and why they'll love it…"
                  data-agent-id="merchant-offer-message-textarea"
                  data-testid="merchant-offer-message-textarea"
                  className="w-full p-3 rounded-xl bg-amber-50/60 dark:bg-slate-800 border border-amber-400/60 text-xs font-medium text-slate-900 dark:text-white leading-relaxed"
                />
                <div className="text-right text-[10px] font-semibold text-slate-500">
                  {message.length}/500
                </div>
              </div>

              <div>
                <label htmlFor="merchant-offer-pulse" className={LABEL_CLASS}>
                  📰 LinkedIn Pulse Article Link{' '}
                  <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="merchant-offer-pulse"
                  type="url"
                  inputMode="url"
                  value={linkedInPulseUrl}
                  onChange={(e) => setLinkedInPulseUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/pulse/your-article"
                  data-agent-id="merchant-offer-pulse-input"
                  data-testid="merchant-offer-pulse-input"
                  className={INPUT_CLASS}
                />
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  Link a LinkedIn Pulse article about your business — travellers see “Read the full
                  story on LinkedIn Pulse” on your postcard.
                </p>
              </div>
            </div>

            {/* Address side */}
            <div className="md:col-span-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-b-2 border-slate-300 dark:border-slate-700 text-xs space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">
                    From the merchant
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">
                    {merchant.businessName}
                  </div>
                  <div className="flex items-start gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-px" aria-hidden="true" />
                    <span>
                      {merchant.addressLine}, {merchant.city}
                    </span>
                  </div>
                  <div className="flex items-start gap-1 text-[11px] font-mono text-amber-800 dark:text-amber-300 break-all">
                    <Phone className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
                    <span>{merchant.contact}</span>
                  </div>
                  <p className="pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    Comes from your business location above — update it there and every postcard
                    follows.
                  </p>
                </div>

                <div>
                  <label htmlFor="merchant-offer-category" className={LABEL_CLASS}>
                    Category *
                  </label>
                  <select
                    id="merchant-offer-category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MerchantOfferCategory | '')}
                    data-agent-id="merchant-offer-category-select"
                    data-testid="merchant-offer-category-select"
                    className={INPUT_CLASS}
                  >
                    <option value="" disabled>
                      Choose a category…
                    </option>
                    {MERCHANT_CATEGORY_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.categories.map((id) => (
                          <option key={id} value={id}>
                            {MERCHANT_CATEGORY_META[id].emoji} {MERCHANT_CATEGORY_META[id].label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <ImageUploadField
                  value={imageUrl}
                  onChange={setImageUrl}
                  uploadName={`${merchant.businessName} ${headline || 'postcard'}`}
                  idPrefix="merchant-offer-photo"
                  label="Postcard Photo (optional)"
                  hint={`No photo? Your postcard gets an illustrated “Greetings from ${merchant.city}” front.`}
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 p-2 rounded-lg"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                data-agent-id="submit-merchant-offer-btn"
                data-testid="submit-merchant-offer-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B91C1C] to-[#0F2557] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
              >
                <Send className="w-4 h-4 text-amber-300" />
                Stamp &amp; Post Offer
              </button>
            </div>
          </form>
        )}
      </div>

      <div aria-hidden="true" className={AIRMAIL_STRIPE_CLASS} />
    </div>
  );
};
