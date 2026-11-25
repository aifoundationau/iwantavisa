import React, { useEffect, useState } from 'react';
import { Loader2, LocateFixed, LogIn, Store, UserPlus, UserRound, X } from 'lucide-react';
import {
  MERCHANT_OFFER_CITIES,
  MerchantLocationSource,
  MerchantOfferCity,
  MerchantProfile,
  MerchantProfileFormSchema,
  RegistrationData,
  RegistrationSchema,
  SignInSchema,
  UserLocation,
  UserRole,
} from '../types/contracts';
import {
  formatAccuracy,
  formatDetectedLabel,
  GeoStatus,
  MERCHANT_SUGGEST_RADIUS_KM,
  toUserLocation,
} from '../lib/geo';
import type { GoogleAccount } from '../lib/auth';

const GoogleLogo: React.FC = () => (
  <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

export interface NewMerchantBusiness {
  businessName: string;
  contact: string;
  city: MerchantOfferCity;
  addressLine: string;
  locationSource: MerchantLocationSource;
  geo?: MerchantProfile['geo'];
}

export type AccountRequest =
  | { kind: 'register'; accountType: 'traveller'; person: RegistrationData; location: UserLocation }
  | {
      kind: 'register';
      accountType: 'merchant';
      person: RegistrationData;
      location: UserLocation;
      business: NewMerchantBusiness;
    }
  | { kind: 'sign-in'; email: string }
  | { kind: 'demo-merchant'; merchantId: string };

export type AccountView = 'register' | 'sign-in';

interface AccountDialogProps {
  initialView: AccountView;
  initialAccountType: UserRole;
  /** 'google': log in / register with Google. 'demo': password-less demo accounts. */
  authMode: 'google' | 'demo';
  googleAccount: GoogleAccount | null;
  googleBusy: boolean;
  googleError: string | null;
  /** intent: Log in signs people in at once (as supporters); Register continues to the details form. */
  onGoogleSignIn: (accountType: UserRole, intent: AccountView) => void;
  geoStatus: GeoStatus;
  /** Listed sample businesses with no registered owner, offered as demo merchant accounts. */
  demoMerchants: MerchantProfile[];
  isEmailRegistered: (email: string) => boolean;
  /** Starts browser geolocation; the result arrives through geoStatus. */
  onDetectLocation: () => void;
  onCancel: () => void;
  onSubmit: (request: AccountRequest) => void;
}

const LABEL_CLASS = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';
const INPUT_CLASS =
  'w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white';

export const AccountDialog: React.FC<AccountDialogProps> = ({
  initialView,
  initialAccountType,
  authMode,
  googleAccount,
  googleBusy,
  googleError,
  onGoogleSignIn,
  geoStatus,
  demoMerchants,
  isEmailRegistered,
  onDetectLocation,
  onCancel,
  onSubmit,
}) => {
  const [view, setView] = useState<AccountView>(initialView);
  const [accountType, setAccountType] = useState<UserRole>(initialAccountType);
  const [error, setError] = useState<string | null>(null);

  // Register form
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationEdited, setLocationEdited] = useState(false);
  const [city, setCity] = useState<MerchantOfferCity>('Phnom Penh');
  const [cityTouched, setCityTouched] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');

  // Sign-in form
  const [signInEmail, setSignInEmail] = useState('');
  const [demoMerchantId, setDemoMerchantId] = useState(demoMerchants[0]?.id ?? '');

  const detected = geoStatus.state === 'detected' ? geoStatus.location : null;
  const suggestion =
    detected && detected.nearestMerchantCity.distanceKm <= MERCHANT_SUGGEST_RADIUS_KM
      ? detected.nearestMerchantCity
      : null;
  const isMerchant = accountType === 'merchant';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  // Auto-fill Location from each detection unless the person has typed their own.
  useEffect(() => {
    if (detected && !locationEdited) setLocationLabel(formatDetectedLabel(detected));
  }, [detected, locationEdited]);

  // Pre-select the nearest postcard city for merchants.
  useEffect(() => {
    if (suggestion && !cityTouched) setCity(suggestion.city);
  }, [suggestion?.city, cityTouched]);

  // Registering with Google: start from the Google account's name (still editable).
  useEffect(() => {
    if (googleAccount?.name) setName((current) => current || googleAccount.name);
  }, [googleAccount?.name]);

  const usingGoogle = authMode === 'google';

  const redetect = () => {
    setLocationEdited(false);
    onDetectLocation();
  };

  const switchView = (next: AccountView) => {
    setView(next);
    setError(null);
    if (next === 'register' && geoStatus.state === 'idle') onDetectLocation();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = RegistrationSchema.safeParse({
      name,
      locationLabel,
      address,
      phone,
      // With Google, the email is the Google account's — not typed.
      email: usingGoogle ? googleAccount?.email ?? '' : email,
      telegram,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Please check your details.');
      return;
    }
    if (!usingGoogle && isEmailRegistered(parsed.data.email)) {
      setError('That email is already registered — sign in instead.');
      return;
    }

    const location: UserLocation =
      detected && parsed.data.locationLabel === formatDetectedLabel(detected)
        ? toUserLocation(detected)
        : { label: parsed.data.locationLabel, source: 'manual' };

    if (!isMerchant) {
      onSubmit({ kind: 'register', accountType: 'traveller', person: parsed.data, location });
      return;
    }

    const business = MerchantProfileFormSchema.safeParse({
      businessName,
      contact: `${parsed.data.telegram} • ${parsed.data.phone}`,
      city,
      addressLine: address,
    });
    if (!business.success) {
      setError(business.error.issues[0]?.message || 'Please check your business details.');
      return;
    }
    const usesDetectedCity = Boolean(detected && suggestion && suggestion.city === business.data.city);
    onSubmit({
      kind: 'register',
      accountType: 'merchant',
      person: parsed.data,
      location,
      business: {
        ...business.data,
        locationSource: usesDetectedCity ? 'auto-detected' : 'manual',
        ...(usesDetectedCity && detected
          ? { geo: { lat: detected.lat, lng: detected.lng, accuracyM: detected.accuracyM } }
          : {}),
      },
    });
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = SignInSchema.safeParse({ email: signInEmail });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Enter the email you registered with.');
      return;
    }
    if (!isEmailRegistered(parsed.data.email)) {
      setError('No account uses that email yet — register first.');
      return;
    }
    onSubmit({ kind: 'sign-in', email: parsed.data.email });
  };

  const title =
    view === 'sign-in' ? 'Log in' : isMerchant ? 'Register your business' : 'Register';

  const accountTypeToggle = (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
      {(
        [
          { id: 'traveller', label: 'Traveller / Expat', icon: <UserRound className="w-3.5 h-3.5" /> },
          { id: 'merchant', label: 'Merchant (business)', icon: <Store className="w-3.5 h-3.5" /> },
        ] as const
      ).map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={accountType === option.id}
          onClick={() => {
            setAccountType(option.id);
            setError(null);
          }}
          data-agent-id={`register-type-${option.id}`}
          data-testid={`register-type-${option.id}`}
          className={`h-9 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            accountType === option.id
              ? 'bg-[#0F2557] text-amber-300 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );

  const googleButton = (testId: string) => (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onGoogleSignIn(accountType, view)}
        disabled={googleBusy}
        data-agent-id={testId}
        data-testid={testId}
        className="w-full h-11 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-bold flex items-center justify-center gap-3 shadow-sm hover:bg-slate-50 disabled:opacity-60"
      >
        {googleBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleLogo />}
        Continue with Google
      </button>
      {googleError && (
        <div role="alert" data-testid="google-sign-in-error" className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 p-2 rounded-lg">
          {googleError}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm overflow-y-auto overscroll-contain">
      <div
        className="min-h-full flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-dialog-title"
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-amber-500/40 space-y-4"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                I Want A Visa Cambodia •{' '}
                {usingGoogle ? 'Sign in with Google' : 'Demo accounts (no password yet)'}
              </span>
              <h3
                id="account-dialog-title"
                className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2"
              >
                {view === 'sign-in' ? (
                  <LogIn className="w-5 h-5 text-amber-600" />
                ) : isMerchant ? (
                  <Store className="w-5 h-5 text-amber-600" />
                ) : (
                  <UserPlus className="w-5 h-5 text-amber-600" />
                )}
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              data-agent-id="close-account-dialog-btn"
              data-testid="close-account-dialog-btn"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {view === 'register' && usingGoogle && !googleAccount ? (
            <div className="space-y-3" data-testid="google-register-step">
              {accountTypeToggle}
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Register with your Google account — you become a supporter the moment you log in. We use
                your Google name and email; next you add your location (auto-detected), phone, Telegram ID
                and — optionally — your address.
              </p>
              {googleButton('google-register-btn')}
            </div>
          ) : view === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3">
              {usingGoogle && googleAccount && (
                <div
                  data-testid="register-supporter-note"
                  className="flex items-start justify-between gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200"
                >
                  <span>
                    <strong>You’re logged in with Google — and a supporter.</strong> Add your details so
                    merchants can reach you{isMerchant ? ', and your business to post offer postcards' : ''}.
                  </span>
                  <button
                    type="button"
                    onClick={onCancel}
                    data-agent-id="register-skip-btn"
                    data-testid="register-skip-btn"
                    className="shrink-0 font-extrabold underline"
                  >
                    Skip for now
                  </button>
                </div>
              )}
              {accountTypeToggle}

              {isMerchant && (
                <div>
                  <label htmlFor="register-business-name" className={LABEL_CLASS}>
                    Business Name *
                  </label>
                  <input
                    id="register-business-name"
                    type="text"
                    required
                    maxLength={80}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Golden Lotus Khmer Kitchen"
                    data-agent-id="register-business-name-input"
                    data-testid="register-business-name-input"
                    className={INPUT_CLASS}
                  />
                </div>
              )}

              <div>
                <label htmlFor="register-name" className={LABEL_CLASS}>
                  Name *
                </label>
                <input
                  id="register-name"
                  type="text"
                  required
                  autoFocus
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Mercer"
                  data-agent-id="register-name-input"
                  data-testid="register-name-input"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <div className="flex items-end justify-between gap-2 mb-1">
                  <label htmlFor="register-location" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Location * <span className="font-normal text-slate-500">(auto-detected)</span>
                  </label>
                  <button
                    type="button"
                    onClick={redetect}
                    disabled={geoStatus.state === 'detecting'}
                    data-agent-id="register-redetect-location-btn"
                    data-testid="register-redetect-location-btn"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1 disabled:opacity-50"
                  >
                    {geoStatus.state === 'detecting' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3 h-3" />
                    )}
                    {geoStatus.state === 'idle' ? 'Detect' : 'Re-detect'}
                  </button>
                </div>
                <input
                  id="register-location"
                  type="text"
                  required
                  maxLength={120}
                  value={locationLabel}
                  onChange={(e) => {
                    setLocationLabel(e.target.value);
                    setLocationEdited(true);
                  }}
                  placeholder={
                    geoStatus.state === 'detecting'
                      ? 'Detecting your location…'
                      : 'e.g. Siem Reap, Cambodia'
                  }
                  aria-describedby="register-location-status"
                  data-agent-id="register-location-input"
                  data-testid="register-location-input"
                  className={INPUT_CLASS}
                />
                <p
                  id="register-location-status"
                  aria-live="polite"
                  data-testid="register-location-status"
                  className="mt-1 text-[10px] text-slate-500 dark:text-slate-400"
                >
                  {geoStatus.state === 'detecting' && 'Detecting your location…'}
                  {geoStatus.state === 'error' && (
                    <span className="font-bold text-rose-700 dark:text-rose-300">
                      {geoStatus.message} Type your city and country above.
                    </span>
                  )}
                  {detected &&
                    (locationLabel.trim() === formatDetectedLabel(detected)
                      ? `📍 Auto-detected (${formatAccuracy(detected.accuracyM)}) — edit it if it's not quite right.`
                      : '✍️ Using your own wording.')}
                  {geoStatus.state === 'idle' && 'Press Detect, or type your city and country.'}
                </p>
              </div>

              {isMerchant && (
                <div>
                  <label htmlFor="register-postcard-city" className={LABEL_CLASS}>
                    Postcard City *{' '}
                    {suggestion && suggestion.city === city && !cityTouched && (
                      <span className="font-normal text-emerald-700 dark:text-emerald-400">(from your location)</span>
                    )}
                  </label>
                  <select
                    id="register-postcard-city"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value as MerchantOfferCity);
                      setCityTouched(true);
                    }}
                    data-agent-id="register-postcard-city-select"
                    data-testid="register-postcard-city-select"
                    className={INPUT_CLASS}
                  >
                    {MERCHANT_OFFER_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="register-address" className={LABEL_CLASS}>
                  {isMerchant ? (
                    <>
                      Business Address * <span className="font-normal text-slate-500">(shown on your postcards)</span>
                    </>
                  ) : (
                    <>
                      Address <span className="font-normal text-slate-500">(optional)</span>
                    </>
                  )}
                </label>
                <input
                  id="register-address"
                  type="text"
                  required={isMerchant}
                  autoComplete="street-address"
                  maxLength={isMerchant ? 100 : 160}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isMerchant ? 'e.g., Street 240, Daun Penh' : 'Street, building or hotel'}
                  data-agent-id="register-address-input"
                  data-testid="register-address-input"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="register-phone" className={LABEL_CLASS}>
                    Phone *
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={24}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    data-agent-id="register-phone-input"
                    data-testid="register-phone-input"
                    className={INPUT_CLASS}
                  />
                </div>
                {usingGoogle && googleAccount ? (
                  <div>
                    <span className={LABEL_CLASS}>Email (Google account)</span>
                    <div
                      data-testid="register-google-email"
                      className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 overflow-hidden"
                    >
                      <GoogleLogo />
                      <span className="truncate">{googleAccount.email}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="register-email" className={LABEL_CLASS}>
                      Email *
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={120}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      data-agent-id="register-email-input"
                      data-testid="register-email-input"
                      className={INPUT_CLASS}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="register-telegram" className={LABEL_CLASS}>
                  Telegram ID *
                </label>
                <input
                  id="register-telegram"
                  type="text"
                  required
                  maxLength={60}
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@yourname"
                  data-agent-id="register-telegram-input"
                  data-testid="register-telegram-input"
                  className={INPUT_CLASS}
                />
              </div>

              {isMerchant && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Your Telegram and phone are printed on your postcards so travellers can reach you.
                </p>
              )}

              {error && (
                <div role="alert" className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 p-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                data-agent-id="submit-register-btn"
                data-testid="submit-register-btn"
                className="w-full h-10 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isMerchant ? 'Register business' : 'Register'}
              </button>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Your location is matched to the nearest city on this device — coordinates aren't sent
                anywhere.
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              {usingGoogle ? (
                <div className="space-y-2">
                  {googleButton('google-sign-in-btn')}
                  <p className="text-[11px] text-slate-600 dark:text-slate-400" data-testid="google-sign-in-note">
                    One tap: logging in with Google makes you a <strong>supporter</strong> straight away —
                    no form to fill. Add your phone and Telegram later with Register.
                  </p>
                </div>
              ) : (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label htmlFor="sign-in-email" className={LABEL_CLASS}>
                    Email you registered with *
                  </label>
                  <input
                    id="sign-in-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    data-agent-id="sign-in-email-input"
                    data-testid="sign-in-email-input"
                    className={INPUT_CLASS}
                  />
                </div>
                {error && (
                  <div role="alert" className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 p-2 rounded-lg">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  data-agent-id="submit-sign-in-btn"
                  data-testid="submit-sign-in-btn"
                  className="w-full h-10 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in &amp; detect my location
                </button>
              </form>
              )}

              {demoMerchants.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label htmlFor="sign-in-demo-merchant" className={LABEL_CLASS}>
                    Demo merchant accounts <span className="font-normal text-slate-500">(sample businesses)</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="sign-in-demo-merchant"
                      value={demoMerchantId}
                      onChange={(e) => setDemoMerchantId(e.target.value)}
                      data-agent-id="sign-in-demo-merchant-select"
                      data-testid="sign-in-demo-merchant-select"
                      className={INPUT_CLASS}
                    >
                      {demoMerchants.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.businessName} — {m.city}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (demoMerchantId) onSubmit({ kind: 'demo-merchant', merchantId: demoMerchantId });
                      }}
                      data-agent-id="sign-in-demo-merchant-btn"
                      data-testid="sign-in-demo-merchant-btn"
                      className="shrink-0 px-4 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-extrabold"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => switchView(view === 'register' ? 'sign-in' : 'register')}
            data-agent-id="account-switch-view-btn"
            data-testid="account-switch-view-btn"
            className="w-full text-center text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
          >
            {view === 'register' ? 'Already registered? Log in' : 'New here? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};
