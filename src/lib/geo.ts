/**
 * Browser geolocation + on-device place matching.
 *
 * Coordinates from navigator.geolocation are matched against a small built-in
 * table of reference places — they are never sent to a third-party geocoder.
 * Labels are city-level ("Siem Reap", "21 km from Kep"); suburb-level names
 * would need a reverse-geocoding service.
 */
import { MERCHANT_OFFER_CITIES, MerchantOfferCity, UserLocation } from '../types/contracts';

export interface LatLng {
  lat: number;
  lng: number;
}

interface ReferencePlace extends LatLng {
  name: string;
  country: 'KH' | 'AU';
}

/** The cities a merchant postcard can be posted from. */
export const MERCHANT_CITY_COORDS: Record<MerchantOfferCity, LatLng> = {
  'Phnom Penh': { lat: 11.5564, lng: 104.9282 },
  'Siem Reap': { lat: 13.3633, lng: 103.8564 },
  Sihanoukville: { lat: 10.6253, lng: 103.5234 },
  Kampot: { lat: 10.6104, lng: 104.1815 },
  'Koh Rong': { lat: 10.7136, lng: 103.2394 },
  Battambang: { lat: 13.0957, lng: 103.2022 },
};

// Remaining provincial towns, so travellers anywhere in Cambodia get a nearby label.
const OTHER_CAMBODIA_TOWNS: ReferencePlace[] = [
  { name: 'Kep', country: 'KH', lat: 10.4829, lng: 104.3167 },
  { name: 'Koh Kong', country: 'KH', lat: 11.6153, lng: 102.9838 },
  { name: 'Poipet', country: 'KH', lat: 13.6593, lng: 102.5642 },
  { name: 'Serei Saophoan', country: 'KH', lat: 13.5859, lng: 102.9737 },
  { name: 'Pailin', country: 'KH', lat: 12.8489, lng: 102.6093 },
  { name: 'Pursat', country: 'KH', lat: 12.5388, lng: 103.9192 },
  { name: 'Kampong Chhnang', country: 'KH', lat: 12.2505, lng: 104.6666 },
  { name: 'Kampong Speu', country: 'KH', lat: 11.4533, lng: 104.5209 },
  { name: 'Takeo', country: 'KH', lat: 10.9908, lng: 104.785 },
  { name: 'Prey Veng', country: 'KH', lat: 11.4868, lng: 105.3253 },
  { name: 'Svay Rieng', country: 'KH', lat: 11.0878, lng: 105.7993 },
  { name: 'Kampong Cham', country: 'KH', lat: 11.9934, lng: 105.4635 },
  { name: 'Suong', country: 'KH', lat: 11.9117, lng: 105.6553 },
  { name: 'Kampong Thom', country: 'KH', lat: 12.7111, lng: 104.8887 },
  { name: 'Kratie', country: 'KH', lat: 12.4881, lng: 106.0188 },
  { name: 'Stung Treng', country: 'KH', lat: 13.5259, lng: 105.9683 },
  { name: 'Banlung', country: 'KH', lat: 13.7394, lng: 106.9873 },
  { name: 'Sen Monorom', country: 'KH', lat: 12.4558, lng: 107.1881 },
  { name: 'Tbeng Meanchey', country: 'KH', lat: 13.8073, lng: 104.9806 },
  { name: 'Samraong', country: 'KH', lat: 14.1817, lng: 103.5176 },
];

const AUSTRALIA_CITIES: ReferencePlace[] = [
  { name: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093 },
  { name: 'Melbourne', country: 'AU', lat: -37.8136, lng: 144.9631 },
  { name: 'Brisbane', country: 'AU', lat: -27.4698, lng: 153.0251 },
  { name: 'Gold Coast', country: 'AU', lat: -28.0167, lng: 153.4 },
  { name: 'Perth', country: 'AU', lat: -31.9505, lng: 115.8605 },
  { name: 'Adelaide', country: 'AU', lat: -34.9285, lng: 138.6007 },
  { name: 'Canberra', country: 'AU', lat: -35.2809, lng: 149.13 },
  { name: 'Hobart', country: 'AU', lat: -42.8821, lng: 147.3272 },
  { name: 'Darwin', country: 'AU', lat: -12.4634, lng: 130.8456 },
  { name: 'Cairns', country: 'AU', lat: -16.9186, lng: 145.7781 },
];

const REFERENCE_PLACES: ReferencePlace[] = [
  ...MERCHANT_OFFER_CITIES.map((name) => ({
    name,
    country: 'KH' as const,
    ...MERCHANT_CITY_COORDS[name],
  })),
  ...OTHER_CAMBODIA_TOWNS,
  ...AUSTRALIA_CITIES,
];

const COUNTRY_LABELS = { KH: 'Cambodia 🇰🇭', AU: 'Australia 🇦🇺' } as const;
const IN_TOWN_KM = 12;
const NEAR_PLACE_KM = 80;

/** Only suggest a postcard city to a merchant when the detected point is this close to it. */
export const MERCHANT_SUGGEST_RADIUS_KM = 80;

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Coarse mainland Australia + Tasmania box — drives the AUD display rule. */
export function isInAustralia(lat: number, lng: number): boolean {
  return lat >= -44 && lat <= -10.4 && lng >= 112.5 && lng <= 154;
}

export function nearestMerchantCity(
  lat: number,
  lng: number
): { city: MerchantOfferCity; distanceKm: number } {
  let best: { city: MerchantOfferCity; distanceKm: number } = {
    city: MERCHANT_OFFER_CITIES[0],
    distanceKm: Number.POSITIVE_INFINITY,
  };
  for (const city of MERCHANT_OFFER_CITIES) {
    const distanceKm = haversineKm({ lat, lng }, MERCHANT_CITY_COORDS[city]);
    if (distanceKm < best.distanceKm) best = { city, distanceKm };
  }
  return best;
}

/** Finds a known place named in a typed location ("BKK1, Phnom Penh" → Phnom Penh centre). */
export function resolvePlacePoint(label: string): LatLng | null {
  const text = label.toLowerCase();
  // Longest names first, so a longer place name wins over a shorter one it contains.
  const match = [...REFERENCE_PLACES]
    .sort((a, b) => b.name.length - a.name.length)
    .find((place) => text.includes(place.name.toLowerCase()));
  return match ? { lat: match.lat, lng: match.lng } : null;
}

/** "650 m", "2.4 km", "148 km"; approximate (city-centre) distances read "~148 km". */
export function formatDistance(km: number, approximate = false): string {
  if (approximate) return `~${Math.max(1, Math.round(km)).toLocaleString()} km`;
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

export function formatAccuracy(accuracyM: number): string {
  return accuracyM >= 1000 ? `±${(accuracyM / 1000).toFixed(1)} km` : `±${Math.round(accuracyM)} m`;
}

function formatCoordinates(lat: number, lng: number): string {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${
    lng >= 0 ? 'E' : 'W'
  }`;
}

export interface DetectedLocation {
  lat: number;
  lng: number;
  accuracyM: number;
  detectedAt: string;
  /** e.g. "Siem Reap", "21 km from Kep", "Sydney", "1.29°N, 103.85°E" */
  placeLabel: string;
  /** e.g. "Cambodia 🇰🇭", "Australia 🇦🇺", "International 🌏" */
  regionLabel: string;
  isInAustralia: boolean;
  nearestMerchantCity: { city: MerchantOfferCity; distanceKm: number };
}

export function describeLocation(
  lat: number,
  lng: number,
  accuracyM: number,
  detectedAt: string = new Date().toISOString()
): DetectedLocation {
  let nearest: { place: ReferencePlace; km: number } | null = null;
  for (const place of REFERENCE_PLACES) {
    const km = haversineKm({ lat, lng }, place);
    if (!nearest || km < nearest.km) nearest = { place, km };
  }

  const inAustralia = isInAustralia(lat, lng);
  let placeLabel = formatCoordinates(lat, lng);
  let regionLabel: string = inAustralia ? COUNTRY_LABELS.AU : 'International 🌏';

  if (nearest && nearest.km <= IN_TOWN_KM) {
    placeLabel = nearest.place.name;
    regionLabel = COUNTRY_LABELS[nearest.place.country];
  } else if (nearest && nearest.km <= NEAR_PLACE_KM) {
    // "N km from X" stays true even just across a border.
    placeLabel = `${Math.round(nearest.km)} km from ${nearest.place.name}`;
    regionLabel = COUNTRY_LABELS[nearest.place.country];
  }

  return {
    lat,
    lng,
    accuracyM: Math.round(accuracyM),
    detectedAt,
    placeLabel,
    regionLabel,
    isInAustralia: inAustralia,
    nearestMerchantCity: nearestMerchantCity(lat, lng),
  };
}

/** "Siem Reap, Cambodia 🇰🇭" — the text pre-filled into the Register form's Location field. */
export function formatDetectedLabel(location: DetectedLocation): string {
  return `${location.placeLabel}, ${location.regionLabel}`;
}

export function toUserLocation(location: DetectedLocation): UserLocation {
  return {
    label: formatDetectedLabel(location),
    source: 'auto-detected',
    lat: location.lat,
    lng: location.lng,
    accuracyM: location.accuracyM,
  };
}

export type GeoErrorKind = 'unsupported' | 'insecure' | 'denied' | 'unavailable' | 'timeout';

const GEO_ERROR_MESSAGES: Record<GeoErrorKind, string> = {
  unsupported: "This browser can't share its location — set it manually instead.",
  insecure: 'Location needs a secure (https) connection — set it manually instead.',
  denied: 'Location permission was declined — allow it in your browser settings, or set it manually.',
  unavailable: "Your device couldn't determine a location right now — try again, or set it manually.",
  timeout: 'Location detection timed out — try again, or set it manually.',
};

export class GeoDetectionError extends Error {
  readonly kind: GeoErrorKind;

  constructor(kind: GeoErrorKind) {
    super(GEO_ERROR_MESSAGES[kind]);
    this.name = 'GeoDetectionError';
    this.kind = kind;
  }
}

export type GeoStatus =
  | { state: 'idle' }
  | { state: 'detecting' }
  | { state: 'detected'; location: DetectedLocation }
  | { state: 'error'; kind: GeoErrorKind; message: string };

/** Asks the browser for the current position (prompting for permission the first time). */
export function detectLocation(timeoutMs = 12000): Promise<DetectedLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new GeoDetectionError('unsupported'));
      return;
    }
    if (!window.isSecureContext) {
      reject(new GeoDetectionError('insecure'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve(
          describeLocation(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          )
        ),
      (error) =>
        // GeolocationPositionError codes: 1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE, 3 TIMEOUT
        reject(
          new GeoDetectionError(
            error.code === 1 ? 'denied' : error.code === 3 ? 'timeout' : 'unavailable'
          )
        ),
      // maximumAge 0: an explicit (re-)detect must not return a stale cached position.
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}

export function toGeoError(err: unknown): GeoDetectionError {
  return err instanceof GeoDetectionError ? err : new GeoDetectionError('unavailable');
}
