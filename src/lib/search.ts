import { MERCHANT_CATEGORY_META } from '../data/cambodiaData';
import {
  MERCHANT_OFFER_CATEGORY_IDS,
  MerchantOffer,
  MerchantOfferCategory,
  MerchantProfile,
} from '../types/contracts';
import { haversineKm, LatLng, MERCHANT_CITY_COORDS } from './geo';
import { bayesianRating, NO_RATING, RatingSummary } from './reviews';

/** How distance, service match and review score combine into one rank (sums to 1). Tune here. */
export const RANKING_WEIGHTS = { proximity: 0.5, service: 0.3, reviews: 0.2 } as const;

/** The proximity score halves at this distance (10 km ≈ across Phnom Penh). */
const PROXIMITY_HALF_KM = 10;

/** Words people type for each kind of need. Hyphens are dropped first ("wi-fi" → "wifi"). */
export const NEED_KEYWORDS: Record<MerchantOfferCategory, readonly string[]> = {
  // Visas & paperwork
  visa_services: ['visa', 'visas', 'extension', 'extend', 'immigration', 'passport', 'eb', 'er', 'evisa', 'overstay'],
  licences: ['licence', 'license', 'driving', 'mpwt', 'permit', 'workpermit'],
  documents_printing: ['translation', 'translate', 'translator', 'notary', 'notarised', 'notarized', 'printing', 'print', 'photocopy', 'photo', 'photos', 'passportphoto', 'document', 'documents'],
  travel_insurance: ['insurance', 'insure', 'insured', 'policy'],
  // Places to stay
  hotels_hostels: ['hotel', 'hostel', 'guesthouse', 'resort', 'room', 'stay', 'sleep', 'accommodation', 'night', 'nights', 'bnb'],
  rental_accommodation: ['room', 'apartment', 'condo', 'stay', 'accommodation', 'house', 'villa', 'studio', 'bungalow', 'lease', 'monthly', 'longterm'],
  // Staying connected
  phone_service: ['sim', 'simcard', 'phone', 'mobile', 'data', 'esim', 'topup', 'calls', '4g', '5g'],
  wifi_service: ['wifi', 'internet', 'router', 'hotspot', 'fibre', 'fiber', 'data', 'online'],
  coworking: ['coworking', 'cowork', 'desk', 'office', 'workspace', 'meeting'],
  repairs: ['repair', 'repairs', 'fix', 'broken', 'screen', 'laptop', 'computer', 'battery', 'charger'],
  // Getting around
  taxis_transfers: ['taxi', 'taxis', 'grab', 'passapp', 'ride', 'transfer', 'airport', 'pickup', 'tuktuk', 'tuk', 'transport'],
  bus_boat_tickets: ['bus', 'ferry', 'boat', 'speedboat', 'ticket', 'tickets', 'coach', 'minivan', 'train', 'transport'],
  car_hire: ['car', 'cars', 'driver', 'chauffeur', 'van', 'suv'],
  motorcycle_rentals: ['motorbike', 'motorcycle', 'scooter', 'moto', 'bike', 'bicycle', 'ebike', 'helmet'],
  // Food & drink
  restaurants: ['food', 'eat', 'eating', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'brunch', 'amok', 'noodles', 'vegetarian', 'vegan', 'hungry', 'meal'],
  bars_nightlife: ['bar', 'bars', 'pub', 'beer', 'cocktail', 'cocktails', 'drinks', 'nightlife', 'club', 'happyhour', 'wine'],
  // Health & wellbeing
  health_clinics: ['clinic', 'doctor', 'hospital', 'dentist', 'dental', 'pharmacy', 'medicine', 'medical', 'vaccine', 'vaccination', 'sick', 'test'],
  massage: ['massage', 'spa', 'relax', 'foot', 'wellness', 'sauna'],
  beauty_salons: ['hair', 'haircut', 'barber', 'salon', 'nails', 'manicure', 'pedicure', 'beauty', 'makeup', 'waxing'],
  fitness: ['gym', 'yoga', 'fitness', 'pilates', 'workout', 'crossfit', 'muay', 'boxing', 'bokator'],
  // Things to do
  tours_transport: ['tour', 'tuktuk', 'tuk', 'angkor', 'temple', 'sunrise', 'guide', 'trip', 'daytrip', 'excursion', 'sightseeing'],
  classes_experiences: ['class', 'classes', 'cooking', 'course', 'lesson', 'lessons', 'workshop', 'experience', 'show', 'apsara', 'dance', 'circus', 'photography'],
  diving_watersports: ['diving', 'dive', 'snorkel', 'snorkelling', 'snorkeling', 'kayak', 'kayaking', 'surf', 'paddle', 'sup', 'swim', 'island', 'beach'],
  shopping_souvenirs: ['shopping', 'souvenir', 'souvenirs', 'market', 'silk', 'pepper', 'gift', 'gifts', 'clothes', 'tailor', 'krama'],
  // Everyday help
  money_exchange: ['money', 'exchange', 'currency', 'cash', 'atm', 'riel', 'khr', 'dollars', 'remittance', 'changer'],
  laundry: ['laundry', 'washing', 'wash', 'dryclean', 'drycleaning', 'ironing'],
  courier_shipping: ['courier', 'shipping', 'ship', 'parcel', 'package', 'delivery', 'post', 'postage'],
  other: [],
};

// Filler and words that apply to every listing here, so they shouldn't steer results.
const STOP_WORDS = new Set([
  'i', 'im', 'a', 'an', 'the', 'need', 'needs', 'want', 'looking', 'look', 'for', 'near', 'nearby',
  'me', 'my', 'to', 'in', 'at', 'on', 'and', 'or', 'of', 'with', 'find', 'get', 'some', 'any',
  'best', 'good', 'cheap', 'please', 'can', 'where', 'is', 'are', 'there', 'who', 'do', 'does',
  'around', 'here', 'today', 'now', 'tourist', 'tourists', 'travel', 'traveller', 'travellers',
  'service', 'services', 'shop', 'place', 'places', 'cambodia',
]);

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // café → cafe
    .replace(/([a-z0-9])-(?=[a-z0-9])/g, '$1'); // wi-fi → wifi, tuk-tuk → tuktuk
}

export function tokenizeNeed(query: string): string[] {
  return normalizeText(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function keywordMatches(token: string, keyword: string): boolean {
  if (token === keyword) return true;
  if (token.length >= 3 && keyword.startsWith(token)) return true; // still typing: "scoo" → scooter
  // Plurals and short suffixes: "massages", "tours" (but not "tourist").
  return keyword.length >= 4 && token.startsWith(keyword) && token.length - keyword.length <= 2;
}

/** The kinds of business a query asks for ("I need a sim card" → phone_service). */
export function detectNeedCategories(tokens: string[]): Set<MerchantOfferCategory> {
  const needs = new Set<MerchantOfferCategory>();
  for (const token of tokens) {
    // An exact keyword wins ("bar" → bars, not barbers); otherwise allow prefixes and plurals.
    const exact = MERCHANT_OFFER_CATEGORY_IDS.filter((c) => NEED_KEYWORDS[c].includes(token));
    const matched =
      exact.length > 0
        ? exact
        : MERCHANT_OFFER_CATEGORY_IDS.filter((c) => NEED_KEYWORDS[c].some((kw) => keywordMatches(token, kw)));
    matched.forEach((category) => needs.add(category));
  }
  return needs;
}

export interface NeedMatch {
  offer: MerchantOffer;
  distanceKm: number | null;
  /** Measured to the city centre because the merchant has no saved GPS pin. */
  isApproximate: boolean;
  rating: RatingSummary;
  scores: { proximity: number; service: number; reviews: number; total: number };
}

export interface NeedSearchInput {
  query: string;
  offers: MerchantOffer[];
  merchants: MerchantProfile[];
  /** Approved-review ratings by merchantId. */
  ratings: Map<string, RatingSummary>;
  userPoint: LatLng | null;
}

/**
 * Merchants that serve the need in the query, ranked by distance, service match and reviews.
 * Without a known location, distance is neutral and the other two signals decide.
 */
export function searchNeeds({ query, offers, merchants, ratings, userPoint }: NeedSearchInput): NeedMatch[] {
  const tokens = tokenizeNeed(query);
  if (tokens.length === 0) return [];
  const needs = detectNeedCategories(tokens);
  const textTokens = tokens.filter((token) => token.length >= 3);
  const merchantById = new Map(merchants.map((m) => [m.id, m]));
  const matches: NeedMatch[] = [];

  for (const offer of offers) {
    const haystack = normalizeText(
      [
        offer.headline,
        offer.businessName,
        offer.message,
        offer.dealBadge,
        MERCHANT_CATEGORY_META[offer.category].label,
        offer.addressLine,
        offer.city,
      ].join(' ')
    );
    const textHits = textTokens.filter((token) => haystack.includes(token)).length;
    const servesNeed = needs.has(offer.category);
    // A recognised need keeps only businesses that offer it; otherwise fall back to text matches.
    if (needs.size > 0 ? !servesNeed : textHits === 0) continue;

    const service = servesNeed ? Math.min(1, 0.8 + 0.1 * textHits) : Math.min(0.7, 0.4 + 0.1 * textHits);
    matches.push(scoreOffer(offer, service, merchantById, ratings, userPoint));
  }

  return matches.sort(byRank);
}

export interface CategoryRankInput {
  category: MerchantOfferCategory;
  offers: MerchantOffer[];
  merchants: MerchantProfile[];
  ratings: Map<string, RatingSummary>;
  userPoint: LatLng | null;
}

/** Every post in one category, ranked by distance (auto-detected location) and review score. */
export function rankCategory({ category, offers, merchants, ratings, userPoint }: CategoryRankInput): NeedMatch[] {
  const merchantById = new Map(merchants.map((m) => [m.id, m]));
  return offers
    .filter((offer) => offer.category === category)
    .map((offer) => scoreOffer(offer, 1, merchantById, ratings, userPoint))
    .sort(byRank);
}

function scoreOffer(
  offer: MerchantOffer,
  service: number,
  merchantById: Map<string, MerchantProfile>,
  ratings: Map<string, RatingSummary>,
  userPoint: LatLng | null
): NeedMatch {
  const merchant = merchantById.get(offer.merchantId);
  const point = merchant?.geo ?? MERCHANT_CITY_COORDS[offer.city];
  const distanceKm = userPoint ? haversineKm(userPoint, point) : null;
  const rating = ratings.get(offer.merchantId) ?? NO_RATING;

  const proximity = distanceKm === null ? 0.5 : 1 / (1 + distanceKm / PROXIMITY_HALF_KM);
  const reviews = (bayesianRating(rating) - 1) / 4;
  const total =
    RANKING_WEIGHTS.proximity * proximity +
    RANKING_WEIGHTS.service * service +
    RANKING_WEIGHTS.reviews * reviews;

  return {
    offer,
    distanceKm,
    isApproximate: !merchant?.geo,
    rating,
    scores: { proximity, service, reviews, total },
  };
}

function byRank(a: NeedMatch, b: NeedMatch): number {
  return (
    b.scores.total - a.scores.total ||
    (a.distanceKm ?? 0) - (b.distanceKm ?? 0) ||
    b.offer.createdAt.localeCompare(a.offer.createdAt)
  );
}
