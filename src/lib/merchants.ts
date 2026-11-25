import { MERCHANT_CITY_STAMP_CODES } from '../data/cambodiaData';
import { MerchantOffer, MerchantOfferCity, MerchantProfile } from '../types/contracts';

/** Random numeric ID (e.g. OFR-482913) that doesn't collide with any taken ID. */
export function generateUniqueId(prefix: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  let id: string;
  do {
    id = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  } while (used.has(id));
  return id;
}

export function buildPostcardStampCode(city: MerchantOfferCity): string {
  return `KH-${MERCHANT_CITY_STAMP_CODES[city]}-${Math.floor(10 + Math.random() * 90)}`;
}

/** Swaps the city segment of a "KH-PNH-..." stamp when a merchant moves city. */
export function restampPostcardCode(code: string, city: MerchantOfferCity): string {
  return code.replace(/^KH-[A-Z]{3}(?=-)/, `KH-${MERCHANT_CITY_STAMP_CODES[city]}`);
}

export interface MerchantLocationUpdate {
  city: MerchantOfferCity;
  addressLine: string;
  locationSource: MerchantProfile['locationSource'];
  geo?: MerchantProfile['geo'];
}

export function applyLocationToProfile(
  profile: MerchantProfile,
  update: MerchantLocationUpdate,
  updatedAt: string
): MerchantProfile {
  const next: MerchantProfile = {
    ...profile,
    city: update.city,
    addressLine: update.addressLine,
    locationSource: update.locationSource,
    locationUpdatedAt: updatedAt,
  };
  if (update.geo) next.geo = update.geo;
  else delete next.geo;
  return next;
}

/** Every postcard owned by the merchant picks up the new city and address. */
export function applyLocationToOffers(
  offers: MerchantOffer[],
  merchantId: string,
  update: MerchantLocationUpdate
): MerchantOffer[] {
  return offers.map((offer) =>
    offer.merchantId === merchantId
      ? {
          ...offer,
          city: update.city,
          addressLine: update.addressLine,
          postcardStampCode: restampPostcardCode(offer.postcardStampCode, update.city),
        }
      : offer
  );
}
