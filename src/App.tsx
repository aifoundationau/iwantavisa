import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Compass,
  Briefcase,
  Building2,
  Cpu,
  ShieldAlert,
  Moon,
  Sun,
  ExternalLink,
  Store,
  LayoutGrid,
  LogIn,
  LogOut,
  MessageCircle,
  UserPlus,
  UserRound,
  Coins,
} from 'lucide-react';
import {
  INITIAL_AGENT_SERVICES,
  INITIAL_CAMBODIA_RENTALS,
  INITIAL_MERCHANT_MESSAGES,
  INITIAL_MERCHANT_REVIEWS,
  INITIAL_MERCHANTS,
  INITIAL_MERCHANT_OFFERS,
  INITIAL_TECH_COMMUNITY_POSTS,
} from './data/cambodiaData';
import {
  AgentServicePromotion,
  CambodiaRentalListing,
  MerchantMessage,
  MerchantOffer,
  MerchantOfferCategory,
  MerchantOfferContent,
  MerchantProfile,
  MerchantReview,
  RentalPostcardMessage,
  ReviewStatus,
  TechCommunityPost,
  TechServiceInquiry,
  UserProfile,
  UserRole,
  UserSession,
} from './types/contracts';
import { CategoriesPage } from './components/CategoriesPage';
import { OfferPostcardDialog } from './components/OfferPostcardDialog';
import { TokenPacks } from './components/TokenPacks';
import { Toast, ToastMessage } from './components/Toast';
import { MerchantReviewsDialog } from './components/MerchantReviewsDialog';
import { MessageContext, MessagesDialog } from './components/MessagesDialog';
import { NeedSearchBar } from './components/NeedSearchBar';
import { ReviewModerationPanel } from './components/ReviewModerationPanel';
import { buildRatingIndex, NO_RATING } from './lib/reviews';
import { markConversationRead, unreadCount } from './lib/messages';
import { CambodiaGuidesHub } from './components/CambodiaGuidesHub';
import { AgentMarketplace } from './components/AgentMarketplace';
import { RentalsPostcardGallery } from './components/RentalsPostcardGallery';
import { MerchantOffersBoard } from './components/MerchantOffersBoard';
import { MerchantDesk } from './components/MerchantDesk';
import { DigitalTechCommunityHub } from './components/DigitalTechCommunityHub';
import { AdminControlPanel } from './components/AdminControlPanel';
import { GeoTimeFooterBar } from './components/GeoTimeFooterBar';
import { AccountDialog, AccountRequest, AccountView } from './components/AccountDialog';
import {
  authMode,
  describeAuthError,
  firebaseErrorCode,
  GoogleAccount,
  googleDisplayName,
  signInWithGoogle,
  signOutOfGoogle,
  watchGoogleAccount,
} from './lib/auth';
import { loadUserProfile, saveUserProfile } from './lib/profiles';
import { useAutoHideHeader } from './lib/scroll';
import {
  createTokenCheckout,
  describeCheckoutError,
  parseCheckoutReturn,
  stripCheckoutReturn,
  TokenPack,
  watchTokenWallet,
} from './lib/tokens';
import { buildOfferUrl, buildTabUrl, MainSectionTab, parseAppRoute } from './lib/routing';
import {
  detectLocation,
  formatDetectedLabel,
  GeoStatus,
  LatLng,
  resolvePlacePoint,
  toGeoError,
  toUserLocation,
} from './lib/geo';
import {
  applyLocationToOffers,
  applyLocationToProfile,
  buildPostcardStampCode,
  generateUniqueId,
  MerchantLocationUpdate,
} from './lib/merchants';

/**
 * Where "Message" / "Review" send people who aren't signed in. With Google, logging in is enough
 * (it makes them a supporter at once); demo mode has no Google, so people register there.
 */
const JOIN_VIEW: AccountView = authMode === 'google' ? 'sign-in' : 'register';

export function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [headerHidden, revealHeader] = useAutoHideHeader();
  // Deep links: #tab hashes (as listed in sitemap.xml) and shared postcards (?offer=OFR-...).
  // A bare address opens the front page (Home): supporter tokens + the hub directory.
  const [initialRoute] = useState(() => parseAppRoute(window.location.href));
  const [activeTab, setActiveTab] = useState<MainSectionTab>(initialRoute.tab ?? 'all');
  const [sharedOfferId, setSharedOfferId] = useState<string | null>(initialRoute.offerId);
  // Shared agent-service (?agent=) and community (?post=) postcards, pinned on their boards.
  const [sharedAgentServiceId, setSharedAgentServiceId] = useState<string | null>(initialRoute.agentServiceId);
  const [sharedCommunityPostId, setSharedCommunityPostId] = useState<string | null>(initialRoute.communityPostId);
  const [spotlightSource, setSpotlightSource] = useState<'link' | 'search'>('link');
  const [selectedCategory, setSelectedCategory] = useState<MerchantOfferCategory | null>(
    initialRoute.categoryId
  );

  // Dynamic Stateful Collections (Ready for Firebase Firestore connection later)
  const [agentServices, setAgentServices] = useState<AgentServicePromotion[]>(
    INITIAL_AGENT_SERVICES
  );
  const [rentals, setRentals] = useState<CambodiaRentalListing[]>(
    INITIAL_CAMBODIA_RENTALS
  );
  const [sentPostcards, setSentPostcards] = useState<RentalPostcardMessage[]>([
    {
      id: 'PCARD-882401',
      rentalId: 'RNT-BKK1-001',
      rentalTitle: 'Skyline Infinity 1BR Executive Suite — BKK1 Golden District',
      recipientAgent: 'Sreyneang Kim (@BKK1ExpatRentals)',
      senderName: 'Liam O’Connor',
      senderEmail: 'liam@nomadfounders.io',
      telegramOrWhatsApp: '@LiamInPhnomPenh',
      currentVisaType: 'EB (Business/Work)',
      moveInDate: '2026-11-20',
      leaseDurationMonths: 12,
      needsFpcsAndSangkat: true,
      message:
        'Arriving in Phnom Penh next week on an E-Class visa. Would love to view this BKK1 unit and confirm 24-hour FPCS app registration for my 1-year EB extension!',
      createdAt: '2026-11-05T08:30:00Z',
    },
  ]);

  const [techInquiries, setTechInquiries] = useState<TechServiceInquiry[]>([
    {
      id: 'TECH-90412',
      founderName: 'Marcus Vance',
      companyOrStartup: 'KramaPay SaaS',
      email: 'marcus@kramapay.io',
      telegramHandle: '@MarcusKramaPay',
      serviceStream: 'CamDX Single-Window Company Registration',
      teamSize: '2-10 Staff',
      projectBrief:
        'Setting up a 100% foreign-owned software company via CamDX in BKK1 and integrating ABA PayWay + NBC Bakong KHQR.',
      createdAt: '2026-11-05T09:00:00Z',
    },
  ]);

  const [communityPosts, setCommunityPosts] = useState<TechCommunityPost[]>(
    INITIAL_TECH_COMMUNITY_POSTS
  );

  const [merchants, setMerchants] = useState<MerchantProfile[]>(INITIAL_MERCHANTS);
  const [merchantOffers, setMerchantOffers] = useState<MerchantOffer[]>(INITIAL_MERCHANT_OFFERS);

  // Registered people + demo session (OAuth 2.0 replaces password-less sign-in later)
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [accountDialog, setAccountDialog] = useState<{
    view: AccountView;
    accountType: UserRole;
  } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>({ state: 'idle' });
  const geoRequestRef = useRef(0);
  const [googleAccount, setGoogleAccount] = useState<GoogleAccount | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Reviews (published only after superadmin approval) and private user ↔ merchant messages
  const [reviews, setReviews] = useState<MerchantReview[]>(INITIAL_MERCHANT_REVIEWS);
  const [messages, setMessages] = useState<MerchantMessage[]>(INITIAL_MERCHANT_MESSAGES);
  const [reviewsMerchantId, setReviewsMerchantId] = useState<string | null>(null);
  const [messagesDialog, setMessagesDialog] = useState<{
    merchantId: string | null;
    context: MessageContext | null;
  } | null>(null);
  // A "Message" click from someone not yet registered resumes after they register / log in.
  const [pendingMessage, setPendingMessage] = useState<{
    merchantId: string;
    context: MessageContext | null;
  } | null>(null);

  // The full postcard, opened from a compact (2-up) grid card
  const [openedOfferId, setOpenedOfferId] = useState<string | null>(null);
  const openOffer = useCallback((offer: MerchantOffer) => setOpenedOfferId(offer.id), []);

  // Supporter tokens (1 token = US$1, never expire): live balance and Stripe Checkout
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenBusyPack, setTokenBusyPack] = useState<TokenPack | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = useCallback(
    (tone: ToastMessage['tone'], text: string) => setToast({ id: Date.now(), tone, text }),
    []
  );
  const dismissToast = useCallback(() => setToast(null), []);

  const signedInMerchant =
    session?.role === 'merchant'
      ? merchants.find((m) => m.id === session.merchantId) ?? null
      : null;

  const ratingIndex = useMemo(() => buildRatingIndex(reviews), [reviews]);
  const pendingReviewCount = reviews.filter((r) => r.status === 'pending').length;
  const myUnreadMessages = session?.userId
    ? unreadCount(messages, { role: 'user', userId: session.userId })
    : 0;

  // Where search & categories measure distance from: the latest detection, else the person's
  // registered location (coordinates, or the known city named in a typed location).
  const detectedLocation = geoStatus.state === 'detected' ? geoStatus.location : null;
  const sessionLocation = session?.location;
  const userPoint = useMemo<LatLng | null>(() => {
    if (detectedLocation) return { lat: detectedLocation.lat, lng: detectedLocation.lng };
    if (sessionLocation?.lat !== undefined && sessionLocation.lng !== undefined) {
      return { lat: sessionLocation.lat, lng: sessionLocation.lng };
    }
    return sessionLocation ? resolvePlacePoint(sessionLocation.label) : null;
  }, [detectedLocation, sessionLocation]);
  const rankingLocationLabel = detectedLocation
    ? formatDetectedLabel(detectedLocation)
    : sessionLocation?.label ?? null;

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Back/forward and hand-edited URLs re-apply the route.
  useEffect(() => {
    const applyRoute = () => {
      const route = parseAppRoute(window.location.href);
      // An unrecognised hash is an in-page anchor (e.g. #ask-tech-services-form), not a route.
      if (!route.tab && window.location.hash.length > 1) return;
      setActiveTab(route.tab ?? 'all');
      setSharedOfferId(route.offerId);
      setSharedAgentServiceId(route.agentServiceId);
      setSharedCommunityPostId(route.communityPostId);
      setSpotlightSource('link');
      setSelectedCategory(route.categoryId);
    };
    window.addEventListener('popstate', applyRoute);
    window.addEventListener('hashchange', applyRoute);
    return () => {
      window.removeEventListener('popstate', applyRoute);
      window.removeEventListener('hashchange', applyRoute);
    };
  }, []);

  const clearSharedPostcards = () => {
    setSharedOfferId(null);
    setSharedAgentServiceId(null);
    setSharedCommunityPostId(null);
  };

  const goToTab = (tab: MainSectionTab) => {
    setActiveTab(tab);
    clearSharedPostcards();
    // replaceState keeps the address bar shareable without adding history entries per tab.
    window.history.replaceState(null, '', buildTabUrl(window.location.href, tab));
  };

  // Back from Stripe Checkout (?tokens=success|cancelled): say what happened, tidy the address bar.
  useEffect(() => {
    const result = parseCheckoutReturn(window.location.href);
    if (!result) return;
    window.history.replaceState(null, '', stripCheckoutReturn(window.location.href));
    if (result === 'success') {
      showToast(
        'success',
        '✅ Payment received — thank you for supporting I Want A Visa! Your tokens appear in your balance within a few seconds.'
      );
    } else {
      showToast('info', 'Checkout cancelled — you weren’t charged.');
    }
  }, [showToast]);

  // The signed-in supporter's live token balance (written only by the payments server).
  const supporterUid = googleAccount?.uid ?? null;
  useEffect(() => {
    setTokenBalance(null);
    if (!supporterUid) return;
    return watchTokenWallet(
      supporterUid,
      (wallet) => setTokenBalance(wallet.balance),
      (error) => {
        setTokenBalance(null);
        console.warn(
          '[iwantavisa] Could not read the token balance — are firestore.rules deployed to the "iwantavisa" database?',
          error
        );
      }
    );
  }, [supporterUid]);

  const tokensLabel = tokenBalance !== null ? `${tokenBalance.toLocaleString('en-US')} Tokens` : 'Tokens';
  const tokensAriaLabel =
    tokenBalance !== null ? `Supporter tokens: ${tokenBalance} — buy more` : 'Buy supporter tokens';

  const openTokens = () => {
    goToTab('all');
    // After the front page renders, bring the token packs into view below the sticky header.
    window.requestAnimationFrame(() =>
      document.getElementById('tokens')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  /**
   * applyToSession: a signed-in person's location follows the new detection. Detection for
   * the Register form doesn't, because the form shows it and the person may edit it.
   */
  const startLocationDetection = (options: { applyToSession: boolean; userId?: string }) => {
    const requestId = ++geoRequestRef.current;
    setGeoStatus({ state: 'detecting' });
    detectLocation()
      .then((location) => {
        if (requestId !== geoRequestRef.current) return; // signed out or re-detected meanwhile
        setGeoStatus({ state: 'detected', location });
        if (!options.applyToSession) return;
        const userLocation = toUserLocation(location);
        setSession((prev) => (prev ? { ...prev, location: userLocation } : prev));
        if (options.userId) {
          setUsers((prev) =>
            prev.map((u) => (u.id === options.userId ? { ...u, location: userLocation } : u))
          );
        }
      })
      .catch((err: unknown) => {
        if (requestId !== geoRequestRef.current) return;
        const geoError = toGeoError(err);
        setGeoStatus({ state: 'error', kind: geoError.kind, message: geoError.message });
      });
  };

  const redetectForSession = () =>
    startLocationDetection({ applyToSession: true, userId: session?.userId });

  // Called from button clicks, so the browser's location prompt follows a user gesture.
  const openAccountDialog = (view: AccountView, accountType: UserRole) => {
    setAccountDialog({ view, accountType });
    setGoogleError(null);
    if (view === 'register' && geoStatus.state !== 'detected' && geoStatus.state !== 'detecting') {
      startLocationDetection({ applyToSession: false });
    }
  };

  const isEmailRegistered = (email: string) => {
    const normalized = email.trim().toLowerCase();
    return users.some((u) => u.email === normalized);
  };

  const handleAccountRequest = (request: AccountRequest) => {
    const now = new Date().toISOString();
    setAccountDialog(null);

    if (request.kind === 'register') {
      // With Google sign-in the profile is keyed by the Google (Firebase Auth) uid and email.
      const viaGoogle = authMode === 'google' && googleAccount !== null;
      const userId = viaGoogle ? googleAccount.uid : generateUniqueId('USR', users.map((u) => u.id));
      let merchantId: string | undefined;
      let merchantBusiness: MerchantProfile | undefined;
      let displayName = request.person.name;
      if (request.accountType === 'merchant') {
        merchantId = generateUniqueId('MER', merchants.map((m) => m.id));
        const { geo, ...business } = request.business;
        merchantBusiness = {
          id: merchantId,
          ...business,
          ...(geo ? { geo } : {}),
          locationUpdatedAt: now,
        };
        const newBusiness = merchantBusiness;
        setMerchants((prev) => [newBusiness, ...prev]);
        displayName = newBusiness.businessName;
      }
      const { name, phone, telegram, address } = request.person;
      const user: UserProfile = {
        id: userId,
        name,
        email: viaGoogle ? googleAccount.email : request.person.email,
        phone,
        telegram,
        ...(address ? { address } : {}),
        location: request.location,
        role: request.accountType,
        ...(merchantId ? { merchantId } : {}),
        ...(merchantBusiness ? { merchantBusiness } : {}),
        registeredAt: now,
      };
      setUsers((prev) => [user, ...prev.filter((u) => u.id !== user.id)]);
      if (viaGoogle) persistProfile(user);
      setSession({
        userId,
        displayName,
        role: request.accountType,
        ...(merchantId ? { merchantId } : {}),
        signedInAt: now,
        location: request.location, // already auto-detected (or typed) in the form
        ...(viaGoogle ? { supporterSince: googleAccount.supporterSince } : {}),
      });
      if (merchantId) goToTab('admin');
      return;
    }

    if (request.kind === 'sign-in') {
      const user = users.find((u) => u.email === request.email);
      if (!user) return;
      const merchant = user.merchantId ? merchants.find((m) => m.id === user.merchantId) : undefined;
      setSession({
        userId: user.id,
        displayName: merchant?.businessName ?? user.name,
        role: user.role,
        ...(user.merchantId ? { merchantId: user.merchantId } : {}),
        signedInAt: now,
        location: user.location,
      });
      if (user.role === 'merchant') goToTab('admin');
      // People sign in, then their location is auto-detected.
      startLocationDetection({ applyToSession: true, userId: user.id });
      return;
    }

    const merchant = merchants.find((m) => m.id === request.merchantId);
    if (!merchant) return;
    setSession({ displayName: merchant.businessName, role: 'merchant', merchantId: merchant.id, signedInAt: now });
    setPendingMessage(null); // demo merchant accounts aren't registered people, so can't message
    goToTab('admin');
    startLocationDetection({ applyToSession: true });
  };

  const handleSignOut = () => {
    geoRequestRef.current++; // ignore any detection still in flight
    setSession(null);
    setGeoStatus({ state: 'idle' });
    void signOutOfGoogle().catch(() => undefined);
  };

  // ---- Google sign-in (Firebase Auth); profiles live in Firestore userProfiles/{uid} ----
  const persistProfile = (profile: UserProfile) => {
    saveUserProfile(profile).catch((error: unknown) =>
      console.warn(
        '[iwantavisa] Could not save the profile to Firestore — are firestore.rules deployed to the "iwantavisa" database?',
        error
      )
    );
  };

  /** 'detect': ask now (explicit log-in). 'if-allowed': only if already permitted (no surprise prompt). */
  type LocationRefresh = 'detect' | 'if-allowed' | 'none';
  const refreshLocation = (userId: string, mode: LocationRefresh) => {
    if (mode === 'detect') {
      // People log in, then their location is auto-detected.
      startLocationDetection({ applyToSession: true, userId });
    } else if (mode === 'if-allowed') {
      navigator.permissions
        ?.query({ name: 'geolocation' })
        .then((status) => {
          if (status.state === 'granted') startLocationDetection({ applyToSession: true, userId });
        })
        .catch(() => undefined);
    }
  };

  /**
   * Signs a Google account in. Every Google account is a supporter, so this needs no form and no
   * database: the session comes from the account itself. `profile` adds registered details
   * (merchant business, phone, Telegram, location) once they've loaded.
   */
  const applyGoogleSession = (account: GoogleAccount, profile: UserProfile | null, location: LocationRefresh) => {
    if (profile) {
      setUsers((prev) => [profile, ...prev.filter((u) => u.id !== profile.id)]);
      const business = profile.merchantBusiness;
      if (business) setMerchants((prev) => (prev.some((m) => m.id === business.id) ? prev : [business, ...prev]));
    }
    setSession((current) => {
      const same = current?.userId === account.uid ? current : null;
      // A fresher auto-detected location beats the one saved at registration.
      const sessionLocation = same?.location ?? profile?.location;
      return {
        userId: account.uid,
        displayName: profile?.merchantBusiness?.businessName ?? profile?.name ?? googleDisplayName(account),
        role: profile?.role ?? 'traveller',
        ...(profile?.merchantId ? { merchantId: profile.merchantId } : {}),
        signedInAt: same?.signedInAt ?? new Date().toISOString(),
        ...(sessionLocation ? { location: sessionLocation } : {}),
        supporterSince: account.supporterSince,
      };
    });
    refreshLocation(account.uid, location);
  };

  /**
   * A Google account has signed in — from the Log in / Register dialog, a token purchase, or
   * restored on page load. They're a supporter at once; registered details follow from Firestore.
   * registerAs: continue to the details form (Register button, business sign-up) if they have none.
   */
  const resolveGoogleAccount = async (
    account: GoogleAccount,
    how: { fromDialog: boolean; registerAs: UserRole | null; isNewSupporter: boolean; location: LocationRefresh }
  ) => {
    const known = users.find((u) => u.id === account.uid) ?? null;
    applyGoogleSession(account, known, how.location);
    if (how.isNewSupporter) {
      showToast(
        'success',
        `🎉 Welcome, ${googleDisplayName(account).split(' ')[0]} — you’re now a supporter of I Want A Visa Cambodia.`
      );
    }
    if (how.fromDialog) {
      // Logging in is instant — the dialog closes now, without waiting for the database. Register
      // (and a business sign-up) continue to the details form.
      setAccountDialog(how.registerAs && !known ? { view: 'register', accountType: how.registerAs } : null);
      if (known?.role === 'merchant') goToTab('admin');
    }

    let loaded: UserProfile | null = null;
    try {
      loaded = await loadUserProfile(account.uid);
    } catch (error) {
      console.warn(
        '[iwantavisa] Could not read userProfiles from Firestore — are firestore.rules deployed to the "iwantavisa" database?',
        error
      );
    }
    if (!loaded) return;
    // Registered details arrived: merge them in (business, phone, Telegram, saved location).
    applyGoogleSession(account, loaded, 'none');
    if (how.fromDialog) {
      // Already registered, so no details form is needed.
      setAccountDialog((current) => (current?.view === 'register' ? null : current));
      if (loaded.role === 'merchant') goToTab('admin');
    }
  };
  const resolveGoogleAccountRef = useRef(resolveGoogleAccount);
  resolveGoogleAccountRef.current = resolveGoogleAccount;
  const explicitSignInRef = useRef(false);

  useEffect(() => {
    if (authMode !== 'google') return;
    return watchGoogleAccount((account) => {
      setGoogleAccount(account);
      if (!account) {
        setSession((current) => (current?.userId ? null : current)); // keep demo merchant sessions
        return;
      }
      // Page load with a remembered Google log-in (explicit log-ins resolve where they started).
      if (!explicitSignInRef.current) {
        void resolveGoogleAccountRef.current(account, {
          fromDialog: false,
          registerAs: null,
          isNewSupporter: false,
          location: 'if-allowed',
        });
      }
    });
  }, []);

  const handleGoogleSignIn = async (accountType: UserRole, intent: AccountView) => {
    setGoogleError(null);
    setGoogleBusy(true);
    explicitSignInRef.current = true;
    try {
      const { account, isNewSupporter } = await signInWithGoogle();
      setGoogleAccount(account);
      await resolveGoogleAccount(account, {
        fromDialog: true,
        // Log in is instant; Register (and a business sign-up) continue to the details form.
        registerAs: intent === 'register' || accountType === 'merchant' ? accountType : null,
        isNewSupporter,
        location: 'detect',
      });
    } catch (error) {
      setGoogleError(describeAuthError(error));
    } finally {
      explicitSignInRef.current = false;
      setGoogleBusy(false);
    }
  };

  // ---- Supporter tokens: Google log-in if needed, then Stripe Checkout (1 token = US$1) ----
  const buyTokens = async (pack: TokenPack) => {
    setTokenError(null);
    if (authMode !== 'google') {
      setTokenError('Buying tokens needs Google sign-in, which is switched off in this demo build.');
      return;
    }
    setTokenBusyPack(pack);
    explicitSignInRef.current = true;
    try {
      if (!googleAccount) {
        // Called straight from the click, so pop-up blockers let the Google window open.
        const { account, isNewSupporter } = await signInWithGoogle();
        setGoogleAccount(account);
        void resolveGoogleAccount(account, {
          fromDialog: false,
          registerAs: null,
          isNewSupporter,
          location: 'if-allowed', // no location prompt on the way to the checkout
        });
      }
      window.location.assign(await createTokenCheckout(pack));
    } catch (error) {
      setTokenError(
        firebaseErrorCode(error).startsWith('auth/') ? describeAuthError(error) : describeCheckoutError(error)
      );
      setTokenBusyPack(null);
    } finally {
      explicitSignInRef.current = false;
    }
  };

  const openMerchantDesk = () => {
    if (session?.role === 'merchant') goToTab('admin');
    else openAccountDialog('register', 'merchant');
  };

  const handleSaveMerchantLocation = (update: MerchantLocationUpdate) => {
    if (!signedInMerchant) return;
    const updatedAt = new Date().toISOString();
    setMerchants((prev) =>
      prev.map((m) => (m.id === signedInMerchant.id ? applyLocationToProfile(m, update, updatedAt) : m))
    );
    setMerchantOffers((prev) => applyLocationToOffers(prev, signedInMerchant.id, update));
    // Keep the owner's saved business snapshot in step (restored at their next sign-in).
    const owner = session?.userId ? users.find((u) => u.id === session.userId) : undefined;
    if (owner?.merchantBusiness?.id === signedInMerchant.id) {
      const updatedOwner: UserProfile = {
        ...owner,
        merchantBusiness: applyLocationToProfile(owner.merchantBusiness, update, updatedAt),
      };
      setUsers((prev) => prev.map((u) => (u.id === owner.id ? updatedOwner : u)));
      if (authMode === 'google') persistProfile(updatedOwner);
    }
  };

  const handlePostMerchantOffer = (content: MerchantOfferContent): MerchantOffer => {
    if (!signedInMerchant) throw new Error('Sign in as a merchant to post offers');
    const { imageUrl, linkedInPulseUrl, ...fields } = content;
    const offer: MerchantOffer = {
      id: generateUniqueId('OFR', merchantOffers.map((o) => o.id)),
      merchantId: signedInMerchant.id,
      businessName: signedInMerchant.businessName,
      contact: signedInMerchant.contact,
      city: signedInMerchant.city,
      addressLine: signedInMerchant.addressLine,
      ...fields,
      ...(imageUrl ? { imageUrl } : {}),
      ...(linkedInPulseUrl ? { linkedInPulseUrl } : {}),
      postcardStampCode: buildPostcardStampCode(signedInMerchant.city),
      createdAt: new Date().toISOString(),
    };
    setMerchantOffers((prev) => [offer, ...prev]);
    return offer;
  };

  const deleteMerchantOffer = (id: string) =>
    setMerchantOffers((prev) => prev.filter((offer) => offer.id !== id));

  // ---- Search & Categories (ranked by distance, service match and reviews) ----
  const useMyLocation = () =>
    startLocationDetection({ applyToSession: Boolean(session), userId: session?.userId });

  const openOfferFromSearch = (offerId: string) => {
    setActiveTab('merchants');
    clearSharedPostcards();
    setSharedOfferId(offerId);
    setSpotlightSource('search');
    window.history.replaceState(null, '', buildOfferUrl(window.location.href, offerId));
  };

  const openCategories = (category: MerchantOfferCategory | null) => {
    setActiveTab('categories');
    clearSharedPostcards();
    setSelectedCategory(category);
    window.history.replaceState(
      null,
      '',
      buildTabUrl(window.location.href, 'categories', category ?? undefined)
    );
    // Ranking uses the auto-detected location: ask once, on this click (a user gesture).
    if (geoStatus.state === 'idle') useMyLocation();
  };

  // ---- Reviews: anyone registered can review; superadmin approves before publishing ----
  const submitReview = (merchantId: string, input: { rating: number; comment: string }) => {
    if (!session?.userId) return;
    const reviewerUserId = session.userId;
    const fullName = users.find((u) => u.id === reviewerUserId)?.name ?? session.displayName;
    const [first, ...rest] = fullName.trim().split(/\s+/);
    const lastInitial = rest.at(-1)?.[0]?.toUpperCase();
    setReviews((prev) => [
      {
        id: generateUniqueId('REV', prev.map((r) => r.id)),
        merchantId,
        reviewerUserId,
        reviewerName: lastInitial ? `${first} ${lastInitial}.` : first, // "Alex M." — privacy
        rating: input.rating,
        comment: input.comment,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const moderateReview = (reviewId: string, status: ReviewStatus) => {
    const moderatedAt = new Date().toISOString();
    setReviews((prev) =>
      prev.map((review) => {
        if (review.id !== reviewId) return review;
        const { moderatedAt: _previous, ...rest } = review;
        return status === 'pending' ? { ...rest, status } : { ...rest, status, moderatedAt };
      })
    );
  };

  // ---- Messages between registered people and merchants ----
  const openMessages = (merchantId: string | null, context: MessageContext | null = null) => {
    if (!session?.userId) {
      if (merchantId) setPendingMessage({ merchantId, context });
      openAccountDialog(JOIN_VIEW, 'traveller');
      return;
    }
    setMessagesDialog({ merchantId, context });
  };

  const messageFromPostcard = (offer: MerchantOffer) =>
    openMessages(offer.merchantId, { offerId: offer.id, offerHeadline: offer.headline });

  const sendUserMessage = (merchantId: string, body: string, context: MessageContext | null) => {
    if (!session?.userId) return;
    const userId = session.userId;
    const userName = users.find((u) => u.id === userId)?.name ?? session.displayName;
    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId('MSG', prev.map((m) => m.id)),
        merchantId,
        userId,
        userName,
        ...(context ? { offerId: context.offerId, offerHeadline: context.offerHeadline } : {}),
        from: 'user',
        body,
        sentAt: new Date().toISOString(),
        readByRecipient: false,
      },
    ]);
  };

  const replyAsMerchant = (userId: string, body: string) => {
    if (!signedInMerchant) return;
    const merchantId = signedInMerchant.id;
    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId('MSG', prev.map((m) => m.id)),
        merchantId,
        userId,
        userName:
          prev.find((m) => m.merchantId === merchantId && m.userId === userId)?.userName ?? 'Traveller',
        from: 'merchant',
        body,
        sentAt: new Date().toISOString(),
        readByRecipient: false,
      },
    ]);
  };

  const sessionUserId = session?.userId;
  const markReadAsUser = useCallback(
    (merchantId: string) => {
      if (sessionUserId) {
        setMessages((prev) => markConversationRead(prev, merchantId, sessionUserId, 'user'));
      }
    },
    [sessionUserId]
  );
  const signedInMerchantId = signedInMerchant?.id;
  const markReadAsMerchant = useCallback(
    (userId: string) => {
      if (signedInMerchantId) {
        setMessages((prev) => markConversationRead(prev, signedInMerchantId, userId, 'merchant'));
      }
    },
    [signedInMerchantId]
  );

  // Resume a "Message" click once the person has registered / logged in (and closed the account dialog).
  const accountDialogOpen = accountDialog !== null;
  useEffect(() => {
    if (!sessionUserId || !pendingMessage || accountDialogOpen) return;
    setMessagesDialog(pendingMessage);
    setPendingMessage(null);
  }, [sessionUserId, pendingMessage, accountDialogOpen]);

  const handleToggleRsvp = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextJoined = !post.rsvpJoined;
        return {
          ...post,
          rsvpJoined: nextJoined,
          attendeesCount: nextJoined
            ? post.attendeesCount + 1
            : Math.max(1, post.attendeesCount - 1),
        };
      })
    );
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#FAF6F0] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 pb-14 angkor-pattern-bg">
      {/* Top Cambodia Royal Accent Bar */}
      <div className="bg-gradient-to-r from-[#0F2557] via-[#B91C1C] to-[#0F2557] text-white px-4 py-1.5 text-[11px] font-bold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>🇰🇭ព្រះរាជាណាចក្រកម្ពុជា • KINGDOM OF CAMBODIA</span>
            <span className="opacity-50 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-amber-300">
              www.iwantavisa.com — Official-Sourced Visa, Banking, Rentals &amp; Tech Hub
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.arrival.gov.kh"
              target="_blank"
              rel="noopener noreferrer"
              data-agent-id="topbar-earrival-link"
              data-testid="topbar-earrival-link"
              className="hover:text-amber-300 inline-flex items-center gap-1"
            >
              arrival.gov.kh <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.evisa.gov.kh"
              target="_blank"
              rel="noopener noreferrer"
              data-agent-id="topbar-evisa-link"
              data-testid="topbar-evisa-link"
              className="hover:text-amber-300 inline-flex items-center gap-1"
            >
              evisa.gov.kh <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://fwcms.mlvt.gov.kh"
              target="_blank"
              rel="noopener noreferrer"
              data-agent-id="topbar-fwcms-link"
              data-testid="topbar-fwcms-link"
              className="hidden md:inline-flex hover:text-amber-300 items-center gap-1"
            >
              fwcms.mlvt.gov.kh <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Header: brand · search · categories · log in (far right).
          Phones: it slides away while scrolling down (3 rows of postcards per screen), back on scroll up. */}
      <header
        id="site-header"
        onFocusCapture={revealHeader}
        className={`sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-amber-500/30 shadow-sm transition-transform duration-300 ${
          headerHidden ? '-translate-y-full' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 space-y-2 sm:space-y-2.5">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-x-3 gap-y-2 sm:gap-y-2.5">
            {/* Brand Logo */}
            <div
              onClick={() => goToTab('all')}
              role="button"
              tabIndex={0}
              data-agent-id="brand-logo-home-btn"
              data-testid="brand-logo-home-btn"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') goToTab('all');
              }}
              className="order-1 flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F2557] via-[#1E3A8A] to-[#B91C1C] flex items-center justify-center text-xl sm:text-2xl shadow-md border border-amber-400">
                🛕
              </div>
              {/* Exactly two lines at every width: name + badge, then site + Khmer tagline */}
              <div className="min-w-0 leading-tight" data-testid="brand-text">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg xl:text-xl font-extrabold tracking-tight text-[#0F2557] dark:text-amber-400 whitespace-nowrap">
                    I WANT A VISA
                  </span>
                  <span className="hidden sm:inline shrink-0 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-extrabold text-amber-900 dark:text-amber-300 whitespace-nowrap">
                    CAMBODIA 🇰🇭
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] sm:text-[11px] font-khmer text-slate-500 dark:text-slate-400 whitespace-nowrap truncate max-w-[10.5rem] sm:max-w-[17rem] lg:max-w-[13.5rem] xl:max-w-[19rem]">
                  www.iwantavisa.com
                  <span className="hidden sm:inline"> • ទិដ្ឋាការ ធនាគារ ខុនដូ និងបច្ចេកវិទ្យាកម្ពុជា</span>
                </p>
              </div>
            </div>

            {/* Search (attached to geolocation), then Categories */}
            <div className="order-3 lg:order-2 w-full lg:w-auto lg:flex-1 min-w-0 flex items-center gap-1.5">
              <div className="flex-1 min-w-0">
                <NeedSearchBar
                  offers={merchantOffers}
                  merchants={merchants}
                  ratings={ratingIndex}
                  userPoint={userPoint}
                  locationLabel={rankingLocationLabel}
                  isDetecting={geoStatus.state === 'detecting'}
                  locationError={geoStatus.state === 'error' ? geoStatus.message : null}
                  onUseMyLocation={useMyLocation}
                  onOpenOffer={openOfferFromSearch}
                />
              </div>
              <button
                type="button"
                onClick={() => openCategories(null)}
                data-agent-id="nav-categories-btn"
                data-testid="nav-categories-btn"
                aria-label="Categories"
                aria-pressed={activeTab === 'categories'}
                className={`h-10 px-3 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
                  activeTab === 'categories'
                    ? 'bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/15'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline lg:hidden xl:inline">Categories</span>
              </button>
              {/* Desktop: Tokens sits up here; smaller screens have it first in the sections row */}
              <button
                type="button"
                onClick={openTokens}
                data-agent-id="header-tokens-btn"
                data-testid="header-tokens-btn"
                aria-label={tokensAriaLabel}
                title={tokensAriaLabel}
                className="hidden lg:flex h-10 px-3 rounded-xl text-xs font-extrabold items-center gap-1.5 shrink-0 bg-amber-400/25 text-amber-900 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-400/40 tabular-nums"
              >
                <Coins className="w-4 h-4" />
                {/* lg: coin (and balance) only — the top bar is busiest there; xl+: the full label */}
                <span className="hidden xl:inline">{tokensLabel}</span>
                {tokenBalance !== null && <span className="xl:hidden">{tokenBalance.toLocaleString('en-US')}</span>}
              </button>
            </div>

            {/* Account — Log in sits far right */}
            <div className="order-2 lg:order-3 ml-auto flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                data-agent-id="desktop-dark-mode-toggle"
                data-testid="desktop-dark-mode-toggle"
                aria-label="Toggle Dark Mode"
                // Phones: signed-in controls need the room; the toggle returns after logging out.
                className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:border-amber-400 border border-transparent ${
                  session ? 'hidden sm:block' : ''
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {session ? (
                <>
                  {/* A supporter who hasn't added their details yet can still register them */}
                  {session.supporterSince && !users.some((u) => u.id === session.userId) && (
                    <button
                      type="button"
                      onClick={() => openAccountDialog('register', 'traveller')}
                      data-agent-id="nav-register-btn"
                      data-testid="nav-register-btn"
                      aria-label="Register your details"
                      title="Register: add your phone, Telegram ID and location"
                      className="px-2.5 2xl:px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 text-[#0F2557] dark:text-amber-300 border border-[#0F2557]/30 dark:border-amber-500/40 hover:bg-amber-500/15"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden 2xl:inline">Register</span>
                    </button>
                  )}
                  {session.userId && (
                    <button
                      type="button"
                      onClick={() => openMessages(null)}
                      data-agent-id="nav-messages-btn"
                      data-testid="nav-messages-btn"
                      aria-label={`Messages${myUnreadMessages ? `, ${myUnreadMessages} unread` : ''}`}
                      title="Messages"
                      className="relative px-2.5 2xl:px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:bg-amber-500/15"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden 2xl:inline">Messages</span>
                      {myUnreadMessages > 0 && (
                        <span
                          data-testid="nav-messages-unread"
                          className="min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center"
                        >
                          {myUnreadMessages}
                        </span>
                      )}
                    </button>
                  )}
                  <div
                    data-testid="nav-session-chip"
                    title={
                      session.supporterSince
                        ? `${session.displayName} · Supporter since ${new Date(session.supporterSince).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : session.displayName
                    }
                    className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-900 dark:text-emerald-200"
                  >
                    <UserRound className="w-3.5 h-3.5 shrink-0" />
                    {/* Phones: just the person icon (name in the tooltip) so the row fits beside the brand */}
                    <span className="hidden sm:inline max-w-[8rem] truncate">{session.displayName}</span>
                    <span className="hidden sm:inline lg:hidden xl:inline text-[10px] font-extrabold uppercase opacity-70">
                      {session.role === 'merchant' ? 'Merchant' : session.supporterSince ? 'Supporter' : 'Traveller'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      aria-label="Log out"
                      title="Log out"
                      data-agent-id="nav-sign-out-btn"
                      data-testid="nav-sign-out-btn"
                      className="p-1.5 rounded-lg hover:bg-emerald-500/20"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAccountDialog('register', 'traveller')}
                    data-agent-id="nav-register-btn"
                    data-testid="nav-register-btn"
                    aria-label="Register"
                    className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 text-[#0F2557] dark:text-amber-300 border border-[#0F2557]/30 dark:border-amber-500/40 hover:bg-amber-500/15"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Register</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAccountDialog('sign-in', 'traveller')}
                    data-agent-id="nav-sign-in-btn"
                    data-testid="nav-sign-in-btn"
                    className="px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 shadow-sm hover:opacity-95"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Site sections (scrolls sideways on small screens) */}
          <nav
            aria-label="Site sections"
            className="flex items-center gap-1.5 overflow-x-auto lg:flex-wrap lg:overflow-visible -mx-1 px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:whitespace-nowrap"
          >
            {/* Supporter tokens live on the front page; this reaches them from anywhere (lg+: top bar) */}
            <button
              type="button"
              onClick={openTokens}
              data-agent-id="nav-tokens-btn"
              data-testid="nav-tokens-btn"
              aria-label={tokensAriaLabel}
              className="lg:hidden px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-amber-400/25 text-amber-900 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-400/40 tabular-nums"
            >
              <Coins className="w-3.5 h-3.5" />
              {tokensLabel}
            </button>

            <button
              type="button"
              onClick={() => goToTab('guides')}
              data-agent-id="nav-tab-guides"
              data-testid="nav-tab-guides"
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === 'guides'
                  ? 'bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-amber-500/15'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Cambodia Guides &amp; Visas (6)
            </button>

            <button
              type="button"
              onClick={() => goToTab('agents')}
              data-agent-id="nav-tab-agents"
              data-testid="nav-tab-agents"
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === 'agents'
                  ? 'bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-amber-500/15'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Agent Services ({agentServices.length})
            </button>

            <button
              type="button"
              onClick={() => goToTab('rentals')}
              data-agent-id="nav-tab-rentals"
              data-testid="nav-tab-rentals"
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === 'rentals'
                  ? 'bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-amber-500/15'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Rentals &amp; Postcards ({rentals.length})
            </button>

            <button
              type="button"
              onClick={() => goToTab('merchants')}
              data-agent-id="nav-tab-merchants"
              data-testid="nav-tab-merchants"
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === 'merchants'
                  ? 'bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-amber-500/15'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Merchant Offers ({merchantOffers.length})
            </button>

            <button
              type="button"
              onClick={() => goToTab('digital-tech')}
              data-agent-id="nav-tab-digital-tech"
              data-testid="nav-tab-digital-tech"
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === 'digital-tech'
                  ? 'bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-amber-500/15'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Digital Transformation &amp; Tech Community
            </button>

            <button
              type="button"
              onClick={() => goToTab('admin')}
              data-agent-id="nav-tab-admin"
              data-testid="nav-tab-admin"
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'bg-amber-500/15 text-amber-900 dark:text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin Panel
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* Front page: supporter tokens (visible before logging in), then the hub directory */}
        {activeTab === 'all' && (
          <TokenPacks
            isSupporter={googleAccount !== null}
            balance={tokenBalance}
            busyPack={tokenBusyPack}
            error={tokenError}
            onBuy={(pack) => void buyTokens(pack)}
          />
        )}

        {/* Category Launchpad (Only when activeTab === 'all') */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Quick Hub Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a category to view full details without endless scrolling
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <button
                type="button"
                onClick={() => goToTab('guides')}
                data-agent-id="launchpad-open-guides"
                data-testid="launchpad-open-guides"
                className="text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-3xl">📄</span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500">
                    Cambodia Guides &amp; Visas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    6 official guides: e-Arrival, Sangkat, ABA Banking, MPWT Driver License, and Visa matrix.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  Open Guides →
                </span>
              </button>

              <button
                type="button"
                onClick={() => goToTab('agents')}
                data-agent-id="launchpad-open-agents"
                data-testid="launchpad-open-agents"
                className="text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-3xl">🤝</span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500">
                    Agent Services ({agentServices.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified Cambodia visa agents, company incorporation, and fast-track VIP assistance.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  Browse Agents →
                </span>
              </button>

              <button
                type="button"
                onClick={() => goToTab('rentals')}
                data-agent-id="launchpad-open-rentals"
                data-testid="launchpad-open-rentals"
                className="text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-3xl">💌</span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500">
                    Condo Rentals &amp; Postcards
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    BKK1, Tonle Bassac, and Toul Kork condos. Send inquiries directly to listing agents.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  View Condos →
                </span>
              </button>

              <button
                type="button"
                onClick={() => goToTab('merchants')}
                data-agent-id="launchpad-open-merchants"
                data-testid="launchpad-open-merchants"
                className="text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-3xl">🏷️</span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500">
                    Merchant Offers ({merchantOffers.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    SIM cards, Wi-Fi, restaurants, massage, motorbike hire, visas &amp; more — shareable postcards from local merchants.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  Browse Offers →
                </span>
              </button>

              <button
                type="button"
                onClick={() => goToTab('digital-tech')}
                data-agent-id="launchpad-open-tech"
                data-testid="launchpad-open-tech"
                className="text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-sm transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-3xl">🚀</span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500">
                    Tech Community &amp; CamDX
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Founder advisory, CamDX registration, ABA PayWay / Bakong APIs, and Phnom Penh meetups.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  Explore Tech Hub →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Render Single Active Section */}
        {activeTab === 'guides' && (
          <div id="guides">
            <CambodiaGuidesHub
              onJumpToAgents={() => goToTab('agents')}
              onJumpToRentals={() => goToTab('rentals')}
            />
          </div>
        )}

        {activeTab === 'agents' && (
          <div id="agents">
            <AgentMarketplace
              services={agentServices}
              onOpenAdminToPost={() => goToTab('admin')}
              sharedServiceId={sharedAgentServiceId}
              onDismissSharedService={() => goToTab('agents')}
            />
          </div>
        )}

        {activeTab === 'rentals' && (
          <div id="rentals">
            <RentalsPostcardGallery
              rentals={rentals}
              sentPostcards={sentPostcards}
              onSendPostcard={(msg) => setSentPostcards((prev) => [msg, ...prev])}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <div id="categories">
            <CategoriesPage
              offers={merchantOffers}
              merchants={merchants}
              ratings={ratingIndex}
              userPoint={userPoint}
              locationLabel={rankingLocationLabel}
              isDetecting={geoStatus.state === 'detecting'}
              locationError={geoStatus.state === 'error' ? geoStatus.message : null}
              selectedCategory={selectedCategory}
              onSelectCategory={openCategories}
              onUseMyLocation={useMyLocation}
              onOpenReviews={setReviewsMerchantId}
              onMessage={messageFromPostcard}
              viewerMerchantId={session?.merchantId ?? null}
              onOpenOffer={openOffer}
            />
          </div>
        )}

        {activeTab === 'merchants' && (
          <div id="merchants">
            <MerchantOffersBoard
              offers={merchantOffers}
              onOpenMerchantDesk={openMerchantDesk}
              sharedOfferId={sharedOfferId}
              spotlightSource={spotlightSource}
              onDismissSharedOffer={() => goToTab('merchants')}
              ratings={ratingIndex}
              onOpenReviews={setReviewsMerchantId}
              onMessage={messageFromPostcard}
              viewerMerchantId={session?.merchantId ?? null}
              onOpenOffer={openOffer}
            />
          </div>
        )}

        {activeTab === 'digital-tech' && (
          <div id="digital-tech">
            <DigitalTechCommunityHub
              communityPosts={communityPosts}
              onToggleRsvp={handleToggleRsvp}
              onCreateCommunityPost={(post) =>
                setCommunityPosts((prev) => [post, ...prev])
              }
              onSubmitTechInquiry={(inq) =>
                setTechInquiries((prev) => [inq, ...prev])
              }
              submittedInquiriesCount={techInquiries.length}
              sharedPostId={sharedCommunityPostId}
              onDismissSharedPost={() => goToTab('digital-tech')}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div id="admin-panel">
            <AdminControlPanel
              // Remount on merchant sign-in/out so the panel opens on the right sub-tab.
              key={session?.merchantId ?? 'no-merchant'}
              initialSubTab={session?.role === 'merchant' ? 'merchant-desk' : 'post-agent'}
              merchantDesk={
                <MerchantDesk
                  merchant={signedInMerchant}
                  offers={merchantOffers.filter((o) => o.merchantId === signedInMerchant?.id)}
                  messages={messages.filter((m) => m.merchantId === signedInMerchant?.id)}
                  rating={(signedInMerchant && ratingIndex.get(signedInMerchant.id)) || NO_RATING}
                  geoStatus={geoStatus}
                  onRequestMerchantSignIn={() => openAccountDialog('register', 'merchant')}
                  onDetectLocation={redetectForSession}
                  onSaveLocation={handleSaveMerchantLocation}
                  onPostOffer={handlePostMerchantOffer}
                  onDeleteOffer={deleteMerchantOffer}
                  onReply={replyAsMerchant}
                  onMarkRead={markReadAsMerchant}
                  onOpenOffer={openOffer}
                />
              }
              reviewModeration={
                <ReviewModerationPanel reviews={reviews} merchants={merchants} onModerate={moderateReview} />
              }
              pendingReviewCount={pendingReviewCount}
              merchantOffers={merchantOffers}
              onDeleteMerchantOffer={deleteMerchantOffer}
              agentServices={agentServices}
              onAddAgentService={(srv) =>
                setAgentServices((prev) => [srv, ...prev])
              }
              onDeleteAgentService={(id) =>
                setAgentServices((prev) => prev.filter((item) => item.id !== id))
              }
              rentals={rentals}
              onAddRental={(r) => setRentals((prev) => [r, ...prev])}
              onDeleteRental={(id) =>
                setRentals((prev) => prev.filter((item) => item.id !== id))
              }
              sentPostcards={sentPostcards}
              onDeletePostcard={(id) =>
                setSentPostcards((prev) => prev.filter((item) => item.id !== id))
              }
              techInquiries={techInquiries}
              onDeleteTechInquiry={(id) =>
                setTechInquiries((prev) => prev.filter((item) => item.id !== id))
              }
              communityPosts={communityPosts}
              onDeleteCommunityPost={(id) =>
                setCommunityPosts((prev) => prev.filter((item) => item.id !== id))
              }
            />
          </div>
        )}
      </main>

      {/* Thin footer: location, USD → KHR converter (Frankfurter) and time */}
      <GeoTimeFooterBar
        geoStatus={geoStatus}
        isSignedIn={session !== null}
        sessionLocation={session?.location ?? null}
        onDetectLocation={redetectForSession}
        onRequestRegister={() => openAccountDialog('register', 'traveller')}
      />

      {(() => {
        const reviewedMerchant = reviewsMerchantId
          ? merchants.find((m) => m.id === reviewsMerchantId)
          : undefined;
        return reviewedMerchant ? (
          <MerchantReviewsDialog
            merchant={reviewedMerchant}
            reviews={reviews}
            rating={ratingIndex.get(reviewedMerchant.id) ?? NO_RATING}
            session={session}
            onSubmitReview={(input) => submitReview(reviewedMerchant.id, input)}
            onRequestRegister={() => openAccountDialog(JOIN_VIEW, 'traveller')}
            onClose={() => setReviewsMerchantId(null)}
          />
        ) : null;
      })()}

      {messagesDialog && session?.userId && (
        <MessagesDialog
          userId={session.userId}
          messages={messages}
          merchants={merchants}
          merchantId={messagesDialog.merchantId}
          context={messagesDialog.context}
          onSelectMerchant={(merchantId) =>
            setMessagesDialog((prev) => (prev ? { ...prev, merchantId } : prev))
          }
          onSend={sendUserMessage}
          onMarkRead={markReadAsUser}
          onClose={() => setMessagesDialog(null)}
        />
      )}

      {(() => {
        const openedOffer = openedOfferId ? merchantOffers.find((o) => o.id === openedOfferId) : undefined;
        return openedOffer ? (
          <OfferPostcardDialog
            offer={openedOffer}
            rating={ratingIndex.get(openedOffer.merchantId) ?? NO_RATING}
            onOpenReviews={setReviewsMerchantId}
            onMessage={session?.merchantId === openedOffer.merchantId ? undefined : messageFromPostcard}
            onClose={() => setOpenedOfferId(null)}
          />
        ) : null;
      })()}

      {/* Rendered last so it stacks above the reviews / messages dialogs it can be opened from */}
      {accountDialog && (
        <AccountDialog
          // A new view (e.g. Log in → "add your details") starts the dialog afresh.
          key={`${accountDialog.view}-${accountDialog.accountType}`}
          initialView={accountDialog.view}
          initialAccountType={accountDialog.accountType}
          authMode={authMode}
          googleAccount={googleAccount}
          googleBusy={googleBusy}
          googleError={googleError}
          onGoogleSignIn={(accountType, intent) => void handleGoogleSignIn(accountType, intent)}
          geoStatus={geoStatus}
          demoMerchants={merchants.filter((m) => !users.some((u) => u.merchantId === m.id))}
          isEmailRegistered={isEmailRegistered}
          onDetectLocation={() => startLocationDetection({ applyToSession: false })}
          onCancel={() => {
            setAccountDialog(null);
            // Already signed in (a supporter skipping their details)? Then a pending message carries on.
            if (!session?.userId) setPendingMessage(null);
          }}
          onSubmit={handleAccountRequest}
        />
      )}

      <Toast message={toast} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
