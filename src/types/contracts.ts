import { z } from 'zod';

export type GuideCategorySlug =
  | 'sangkat-residence-fpcs'
  | 'cambodia-e-arrival'
  | 'condo-rental-cambodia'
  | 'cambodia-bank-account'
  | 'mpwt-driving-license'
  | 'visa-work-permit-matrix';

export interface CambodiaGuide {
  id: string;
  slug: GuideCategorySlug;
  badgeEmoji: string;
  title: string;
  khmerSubtitle: string;
  replacedThaiDocNote: string;
  summary: string;
  officialPortals: {
    label: string;
    url: string;
    authority: string;
  }[];
  whatIsIt: {
    description: string;
    usedFor: string[];
  };
  documentsNeeded: {
    emoji: string;
    item: string;
    detail: string;
    mandatory: boolean;
  }[];
  whereToApply: {
    title: string;
    locations: string[];
    proTip: string;
  };
  processSteps: {
    stepNumber: number;
    emoji: string;
    title: string;
    detail: string;
  }[];
  costBreakdown: {
    officialFee: string;
    agentAssistedFee: string;
    tokenEquivalent: number;
    priceUsd: number;
    priceAud: number;
  };
  bonusTips: string[];
}

export interface CambodiaVisaCategory {
  id: string;
  code: string;
  name: string;
  khmerName: string;
  targetAudience: string;
  initialStay: string;
  extensionOptions: string;
  workAllowed: string;
  officialCostUsd: number;
  agentAssistedUsd: number;
  agentAssistedAud: number;
  tokenAmount: number;
  keyRequirements: string[];
  officialPortalUrl: string;
}

export type AgentServiceCategory =
  | 'visa_extensions'
  | 'sangkat_fpcs'
  | 'bank_account'
  | 'driver_license_mpwt'
  | 'condo_relocation'
  | 'camdx_incorporation'
  | 'work_permit_fwcms';

/** Agent services, community posts (and their postcards) carry up to this many photos. */
export const MAX_POSTCARD_PHOTOS = 6;

export interface AgentServicePromotion {
  id: string;
  agentName: string;
  agencyTitle: string;
  avatarEmoji: string;
  category: AgentServiceCategory;
  serviceTitle: string;
  description: string;
  deliverables: string[];
  turnaroundDays: string;
  priceUsd: number;
  /** Legacy (pre USD-only); no longer shown. */
  tokenCost?: number;
  /** Legacy (pre USD-only); no longer shown. */
  priceAud?: number;
  city: 'Phnom Penh' | 'Siem Reap' | 'Sihanoukville' | 'Kampot' | 'Battambang';
  sangkatDistrict: string;
  verifiedLicenseNo: string;
  contactTelegram: string;
  contactPhoneKh: string;
  rating: number;
  reviewCount: number;
  isLockedFromCsv?: boolean;
  /** Postcard photos (16:9, imgbb), cover first — up to MAX_POSTCARD_PHOTOS. None = illustrated front. */
  imageUrls?: string[];
  /** When the service was posted (the postcard's postmark). */
  createdAt?: string;
}

export interface CambodiaRentalListing {
  id: string;
  title: string;
  khmerNeighborhood: string;
  propertyType: 'Condo' | 'Serviced Apartment' | 'Pool Villa' | 'Shophouse Loft' | 'Riverside Studio';
  city: 'Phnom Penh' | 'Siem Reap' | 'Sihanoukville' | 'Kampot' | 'Koh Rong';
  sangkat: string;
  priceUsdMonthly: number;
  /** Legacy (pre USD-only); no longer shown. */
  priceAudMonthly?: number;
  /** Legacy (pre USD-only); no longer shown. */
  tokenDeposit?: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  fpcsGuaranteed: boolean;
  sangkatCertAssisted: boolean;
  edcRateKhr: string;
  imageUrl: string;
  badgeText: string;
  amenities: string[];
  agentName: string;
  agentAgency: string;
  agentTelegram: string;
  postcardStampCode: string;
  isLockedFromCsv?: boolean;
}

export interface RentalPostcardMessage {
  id: string;
  rentalId: string;
  rentalTitle: string;
  recipientAgent: string;
  senderName: string;
  senderEmail: string;
  telegramOrWhatsApp: string;
  currentVisaType: string;
  moveInDate: string;
  leaseDurationMonths: number;
  needsFpcsAndSangkat: boolean;
  message: string;
  createdAt: string;
}

export interface TechServicePillar {
  id: string;
  iconEmoji: string;
  title: string;
  khmerTitle: string;
  governmentFramework: string;
  officialPortal: string;
  description: string;
  deliverables: string[];
  tokenEstimate: number;
  priceUsd: number;
  priceAud: number;
}

export interface TechServiceInquiry {
  id: string;
  founderName: string;
  companyOrStartup: string;
  email: string;
  telegramHandle: string;
  serviceStream: string;
  teamSize: string;
  projectBrief: string;
  createdAt: string;
}

export const COMMUNITY_POST_CATEGORIES = [
  'Meetup & Hackathon',
  'Founder Q&A',
  'AI & DevOps',
  'Fintech & Bakong',
  'Co-Living & Nomads',
] as const;

export type CommunityPostCategory = (typeof COMMUNITY_POST_CATEGORIES)[number];

export interface TechCommunityPost {
  id: string;
  authorName: string;
  authorRole: string;
  avatarEmoji: string;
  hubLocation: string;
  category: CommunityPostCategory;
  title: string;
  summary: string;
  eventDate: string;
  attendeesCount: number;
  rsvpJoined?: boolean;
  createdAt: string;
  /** Postcard photos (16:9, imgbb), cover first — up to MAX_POSTCARD_PHOTOS. None = illustrated front. */
  imageUrls?: string[];
}

// Merchant Offer Postcards — anything a traveller needs, posted by local merchants.
// Ordered by group (see MERCHANT_CATEGORY_GROUPS); never rename an ID — stored offers use it.
export const MERCHANT_OFFER_CATEGORY_IDS = [
  // Visas & paperwork
  'visa_services',
  'licences',
  'documents_printing',
  'travel_insurance',
  // Places to stay
  'hotels_hostels',
  'rental_accommodation',
  // Staying connected
  'phone_service',
  'wifi_service',
  'coworking',
  'repairs',
  // Getting around
  'taxis_transfers',
  'bus_boat_tickets',
  'car_hire',
  'motorcycle_rentals',
  // Food & drink
  'restaurants',
  'bars_nightlife',
  // Health & wellbeing
  'health_clinics',
  'massage',
  'beauty_salons',
  'fitness',
  // Things to do
  'tours_transport',
  'classes_experiences',
  'diving_watersports',
  'shopping_souvenirs',
  // Everyday help
  'money_exchange',
  'laundry',
  'courier_shipping',
  'other',
] as const;

export type MerchantOfferCategory = (typeof MERCHANT_OFFER_CATEGORY_IDS)[number];

export const MERCHANT_OFFER_CITIES = [
  'Phnom Penh',
  'Siem Reap',
  'Sihanoukville',
  'Kampot',
  'Koh Rong',
  'Battambang',
] as const;

export type MerchantOfferCity = (typeof MERCHANT_OFFER_CITIES)[number];

export interface MerchantOffer {
  id: string;
  /** Owning merchant — location updates on the profile propagate to these offers. */
  merchantId: string;
  // Denormalized from the merchant profile so the public board can filter by city.
  businessName: string;
  contact: string;
  city: MerchantOfferCity;
  addressLine: string;
  category: MerchantOfferCategory;
  headline: string;
  dealBadge: string;
  message: string;
  imageUrl?: string;
  linkedInPulseUrl?: string;
  postcardStampCode: string;
  createdAt: string;
}

export type MerchantLocationSource = 'auto-detected' | 'manual';

export interface MerchantProfile {
  id: string;
  businessName: string;
  contact: string;
  city: MerchantOfferCity;
  addressLine: string;
  /** Saved only when the merchant accepts an auto-detected location. */
  geo?: { lat: number; lng: number; accuracyM: number };
  locationSource: MerchantLocationSource;
  locationUpdatedAt: string;
}

export type UserRole = 'traveller' | 'merchant';

export interface UserLocation {
  /** e.g. "Siem Reap, Cambodia 🇰🇭" — auto-detected, editable when registering */
  label: string;
  source: MerchantLocationSource;
  lat?: number;
  lng?: number;
  accuracyM?: number;
}

/** A registered person (traveller or merchant owner). Contains PII. */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  telegram: string;
  address?: string;
  location: UserLocation;
  role: UserRole;
  merchantId?: string;
  /** The merchant's business, restored at sign-in until merchantProfiles move to Firestore. */
  merchantBusiness?: MerchantProfile;
  registeredAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/** A review of a merchant business. Only superadmin-approved reviews are published. */
export interface MerchantReview {
  id: string;
  merchantId: string;
  /** Registered reviewer — people register before they can review. */
  reviewerUserId: string;
  reviewerName: string;
  /** Whole stars, 1–5. */
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  moderatedAt?: string;
}

/**
 * One message in a private conversation between a registered person and a merchant.
 * A conversation is every message sharing the same merchantId + userId.
 */
export interface MerchantMessage {
  id: string;
  merchantId: string;
  userId: string;
  userName: string;
  /** Postcard the conversation started from, shown as context to the merchant. */
  offerId?: string;
  offerHeadline?: string;
  from: 'user' | 'merchant';
  body: string;
  sentAt: string;
  readByRecipient: boolean;
}

/**
 * The signed-in person. With Google sign-in, logging in creates the session at once: every Google
 * account is a supporter, registered details (phone, Telegram, business…) are added separately.
 * Demo mode (VITE_AUTH_MODE=demo) signs in password-less demo accounts instead.
 */
export interface UserSession {
  /** Absent for the demo merchant accounts (listed sample businesses). */
  userId?: string;
  displayName: string;
  role: UserRole;
  merchantId?: string;
  signedInAt: string;
  /** Registered location, then kept up to date by each auto-detection. */
  location?: UserLocation;
  /** Google log-ins only: ISO time of their first Google log-in, when they became a supporter. */
  supporterSince?: string;
}

// Strict Zod Validation Contracts (mirroring data-contracts.MD)

/** A postcard's photos: imgbb links (uploaded and cropped to 16:9 in the browser), cover first. */
export const PostcardPhotosSchema = z
  .array(
    z
      .string()
      .trim()
      .max(2048)
      .refine(isImgbbImageUrl, 'Photos must be uploaded with the photo picker (they are hosted on imgbb)')
  )
  .max(MAX_POSTCARD_PHOTOS, `Up to ${MAX_POSTCARD_PHOTOS} photos per postcard`)
  .refine((urls) => new Set(urls).size === urls.length, 'The same photo is in there twice');

export const AgentServiceFormSchema = z
  .object({
    agentName: z.string().trim().min(2).max(80),
    agencyTitle: z.string().trim().min(3).max(100),
    category: z.enum([
      'visa_extensions',
      'sangkat_fpcs',
      'bank_account',
      'driver_license_mpwt',
      'condo_relocation',
      'camdx_incorporation',
      'work_permit_fwcms',
    ]),
    serviceTitle: z.string().trim().min(5).max(120),
    description: z.string().trim().min(10).max(800),
    deliverablesRaw: z.string().trim().min(3).max(500),
    turnaroundDays: z.string().trim().min(2).max(40),
    priceUsd: z.number().int().min(1).max(50000),
    city: z.enum(['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Kampot', 'Battambang']),
    sangkatDistrict: z.string().trim().min(2).max(80),
    verifiedLicenseNo: z.string().trim().min(4).max(30),
    contactTelegram: z.string().trim().regex(/^@[A-Za-z0-9_]{3,32}$/, 'Telegram handle must start with @'),
    contactPhoneKh: z.string().trim().min(8).max(20),
    imageUrls: PostcardPhotosSchema,
  })
  .strict();

/** "+ Post Meetup / Topic" on the Tech Community board. */
export const CommunityPostFormSchema = z
  .object({
    authorName: z.string().trim().min(2, 'Your name is required').max(80),
    authorRole: z
      .string()
      .trim()
      .max(80)
      .refine((v) => v === '' || v.length >= 2, 'Your role needs at least 2 characters')
      .transform((v) => v || 'Tech Founder & Builder'),
    hubLocation: z.string().trim().min(2, 'Add the hub or place, e.g. “BKK1, Phnom Penh”').max(80),
    category: z.enum(COMMUNITY_POST_CATEGORIES, {
      errorMap: () => ({ message: 'Choose a category' }),
    }),
    title: z.string().trim().min(5, 'The title needs at least 5 characters').max(140),
    summary: z.string().trim().min(10, 'Describe it in a sentence or two (10+ characters)').max(800),
    eventDate: z.string().trim().max(40, 'Keep the date under 40 characters'),
    imageUrls: PostcardPhotosSchema,
  })
  .strict();

export type CommunityPostFormData = z.infer<typeof CommunityPostFormSchema>;

export const RentalListingFormSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    khmerNeighborhood: z.string().trim().min(1).max(80),
    propertyType: z.enum(['Condo', 'Serviced Apartment', 'Pool Villa', 'Shophouse Loft', 'Riverside Studio']),
    city: z.enum(['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Kampot', 'Koh Rong']),
    sangkat: z.string().trim().min(2).max(80),
    priceUsdMonthly: z.number().int().min(100).max(25000),
    bedrooms: z.number().int().min(0).max(12),
    bathrooms: z.number().int().min(1).max(12),
    areaSqm: z.number().int().min(18).max(2000),
    fpcsGuaranteed: z.boolean(),
    sangkatCertAssisted: z.boolean(),
    edcRateKhr: z.string().trim().min(2).max(40),
    imageUrl: z.string().trim().refine(isImgbbImageUrl, 'Upload a photo of the property'),
    badgeText: z.string().trim().min(2).max(50),
    amenitiesRaw: z.string().trim().min(3).max(400),
    agentName: z.string().trim().min(2).max(80),
    agentAgency: z.string().trim().min(2).max(80),
    agentTelegram: z.string().trim().regex(/^@[A-Za-z0-9_]{3,32}$/, 'Must start with @'),
  })
  .strict();

export const PostcardMessageSchema = z
  .object({
    senderName: z.string().trim().min(2, 'Your name is required').max(80),
    senderEmail: z.string().trim().email('Valid email required').max(120),
    telegramOrWhatsApp: z.string().trim().min(3, 'Telegram or WhatsApp contact required').max(40),
    currentVisaType: z.string().min(2).max(60),
    moveInDate: z.string().min(4, 'Preferred move-in date required'),
    leaseDurationMonths: z.number().int().min(1).max(60),
    needsFpcsAndSangkat: z.boolean(),
    message: z.string().trim().min(5, 'Please write a short note on your postcard').max(600),
  })
  .strict();

export const TechServiceInquirySchema = z
  .object({
    founderName: z.string().trim().min(2, 'Founder or contact name required').max(80),
    companyOrStartup: z.string().trim().min(2, 'Company or startup name required').max(100),
    email: z.string().trim().email('Valid email address required').max(120),
    telegramHandle: z.string().trim().min(2, 'Telegram or phone required').max(40),
    serviceStream: z.string().min(3).max(120),
    teamSize: z.string().min(2).max(40),
    projectBrief: z.string().trim().min(10, 'Please describe your digital transformation or tech goals').max(1000),
  })
  .strict();

/** Uploaded photos are hosted on imgbb; postcards and listings only accept those links. */
export function isImgbbImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'i.ibb.co' && url.pathname.length > 1;
  } catch {
    return false;
  }
}

/**
 * True only for LinkedIn Pulse article links on linkedin.com or a regional
 * subdomain, e.g. https://www.linkedin.com/pulse/your-article-slug-author/
 */
export function isLinkedInPulseUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  return (
    url.protocol === 'https:' &&
    (host === 'linkedin.com' || host.endsWith('.linkedin.com')) &&
    url.port === '' &&
    url.username === '' &&
    url.password === '' &&
    /^\/pulse\/[^/]+/.test(url.pathname)
  );
}

/** Strips the tracking query string / fragment LinkedIn appends to copied article links. */
export function normalizeLinkedInPulseUrl(value: string): string {
  const url = new URL(value.trim());
  return `https://${url.hostname.toLowerCase()}${url.pathname}`;
}

const merchantLocationShape = {
  city: z.enum(MERCHANT_OFFER_CITIES, {
    errorMap: () => ({ message: 'Choose the city where travellers can find you' }),
  }),
  addressLine: z.string().trim().min(2, 'Street, area or landmark is required').max(100),
};

/** Merchant Desk "business location" form (auto-detected, then adjustable). */
export const MerchantLocationFormSchema = z.object(merchantLocationShape).strict();

/** New-merchant registration on the demo sign-in. */
export const MerchantProfileFormSchema = z
  .object({
    businessName: z.string().trim().min(2, 'Business name is required').max(80),
    contact: z.string().trim().min(3, 'Telegram, WhatsApp or phone contact is required').max(80),
    ...merchantLocationShape,
  })
  .strict();

/** 8–15 digits; optional leading +, spaces, dashes and brackets (e.g. +855 12 345 678, 0412 345 678). */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[0-9\s()-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '').length;
  return digits >= 8 && digits <= 15;
}

// Accepts "@alex_pp", "alex_pp" or a pasted t.me/alex_pp link.
function stripTelegramPrefix(value: string): string {
  return value
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?(?:t|telegram)\.me\//i, '')
    .replace(/^@/, '');
}

/** Telegram usernames: start with a letter; letters, digits or _; 4–32 characters. */
export function isValidTelegramHandle(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(stripTelegramPrefix(value));
}

export function normalizeTelegramHandle(value: string): string {
  return `@${stripTelegramPrefix(value)}`;
}

/** The Register form: Name, Location (auto-detected), Address (optional), Phone, Email, Telegram ID. */
export const RegistrationSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name').max(80),
    locationLabel: z
      .string()
      .trim()
      .min(2, 'Location is required — allow location access, or type your city and country')
      .max(120),
    address: z
      .string()
      .trim()
      .max(160)
      .transform((v) => v || undefined),
    phone: z
      .string()
      .trim()
      .refine(isValidPhone, 'Enter a valid phone number, e.g. +855 12 345 678'),
    email: z.string().trim().toLowerCase().email('Enter a valid email address').max(120),
    telegram: z
      .string()
      .trim()
      .refine(
        isValidTelegramHandle,
        'Telegram ID is your @username — 4–32 letters, numbers or _ (e.g. @alex_pp)'
      )
      .transform(normalizeTelegramHandle),
  })
  .strict();

export type RegistrationData = z.infer<typeof RegistrationSchema>;

export const SignInSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter the email you registered with'),
  })
  .strict();

export const MessageFormSchema = z
  .object({
    body: z.string().trim().min(1, 'Write a message first').max(1000, 'Keep messages under 1,000 characters'),
  })
  .strict();

export const ReviewFormSchema = z
  .object({
    rating: z
      .number({ invalid_type_error: 'Choose a star rating' })
      .int()
      .min(1, 'Choose a star rating')
      .max(5),
    comment: z
      .string()
      .trim()
      .min(10, 'Tell other travellers a little more (10+ characters)')
      .max(600),
  })
  .strict();

/** Offer-specific postcard fields; business details come from the merchant profile. */
export const MerchantOfferContentSchema = z
  .object({
    category: z.enum(MERCHANT_OFFER_CATEGORY_IDS, {
      errorMap: () => ({ message: 'Choose a category for your offer' }),
    }),
    headline: z.string().trim().min(5, 'Offer headline needs at least 5 characters').max(100),
    dealBadge: z
      .string()
      .trim()
      .min(2, 'Add a short deal badge, e.g. "20% OFF" or "FREE SIM"')
      .max(24, 'Deal badge must be 24 characters or fewer'),
    message: z.string().trim().min(10, 'Write a short postcard message (10+ characters)').max(500),
    imageUrl: z
      .string()
      .trim()
      .max(2048)
      .refine((v) => v === '' || isImgbbImageUrl(v), 'Upload the postcard photo (photos are hosted on imgbb)')
      .transform((v) => v || undefined),
    linkedInPulseUrl: z
      .string()
      .trim()
      .max(2048)
      .refine(
        (v) => v === '' || isLinkedInPulseUrl(v),
        'LinkedIn link must be a Pulse article, e.g. https://www.linkedin.com/pulse/your-article'
      )
      .transform((v) => (v ? normalizeLinkedInPulseUrl(v) : undefined)),
  })
  .strict();

export type MerchantOfferContent = z.infer<typeof MerchantOfferContentSchema>;
