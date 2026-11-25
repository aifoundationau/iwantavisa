import { MERCHANT_OFFER_CITIES, MerchantOfferCity } from '../types/contracts';

/**
 * The postcard city named in free text — e.g. a community hub "BioLab Coffee & Co-Working,
 * Siem Reap" → "Siem Reap". The earliest mention wins ("Kampot Riverfront & Phnom Penh" → Kampot).
 */
export function cityInText(text: string): MerchantOfferCity | null {
  const lower = text.toLowerCase();
  let best: { city: MerchantOfferCity; at: number } | null = null;
  for (const city of MERCHANT_OFFER_CITIES) {
    const at = lower.indexOf(city.toLowerCase());
    if (at >= 0 && (!best || at < best.at)) best = { city, at };
  }
  return best?.city ?? null;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
// Month names and their abbreviations only — "Night Market 7 PM" is not March 7.
const MONTH_WORD =
  '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?';

function dayMonth(day: string, month: string): string | null {
  const d = Number(day);
  return d >= 1 && d <= 31 ? `${month.slice(0, 3).toUpperCase()} ${d}` : null;
}

/**
 * The sticker on a community postcard: the event's day, read from the free-text date —
 * "Thursday, Nov 12, 2026 • 6:30 PM ICT" → "NOV 12", "27 November" → "NOV 27",
 * "2026-11-27" → "NOV 27". Null when no day can be read.
 */
export function eventDateSticker(eventDate: string): string | null {
  const monthFirst = eventDate.match(new RegExp(`\\b${MONTH_WORD}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i'));
  if (monthFirst) return dayMonth(monthFirst[2], monthFirst[1]);
  const dayFirst = eventDate.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${MONTH_WORD}(?![a-z])`, 'i'));
  if (dayFirst) return dayMonth(dayFirst[1], dayFirst[2]);
  const iso = eventDate.match(/\b\d{4}-(\d{2})-(\d{2})\b/);
  if (iso) {
    const month = MONTHS[Number(iso[1]) - 1];
    return month ? dayMonth(iso[2], month) : null;
  }
  return null;
}
