/**
 * Pure rules for supporter tokens (no Firebase or Stripe imports, so they're unit-testable).
 * 1 token = US$1; packs of 10, 50 or 100; tokens never expire.
 */

export const TOKEN_PACKS = [10, 50, 100] as const;
export type TokenPack = (typeof TOKEN_PACKS)[number];
export const USD_CENTS_PER_TOKEN = 100;

export function isTokenPack(value: unknown): value is TokenPack {
  return typeof value === 'number' && (TOKEN_PACKS as readonly number[]).includes(value);
}

/** Sites Stripe may send people back to (Firebase Auth keeps people logged in per origin). */
export const ALLOWED_RETURN_ORIGINS: readonly string[] = [
  'https://www.iwantavisa.com',
  'https://iwantavisa.com',
  'https://ai-foundation-firebase.web.app',
  'https://ai-foundation-firebase.firebaseapp.com',
  'http://localhost:5178',
  'http://127.0.0.1:5178',
  'http://localhost:5173',
];

/**
 * The app address to return to after checkout: the caller's own address when its origin is on the
 * allow-list (never an arbitrary site — no open redirect), otherwise the configured fallback.
 */
export function resolveReturnBase(
  requested: unknown,
  fallback: string,
  allowedOrigins: readonly string[] = ALLOWED_RETURN_ORIGINS
): string {
  if (typeof requested === 'string') {
    try {
      const url = new URL(requested);
      if (allowedOrigins.includes(url.origin)) return `${url.origin}${url.pathname}`;
    } catch {
      // not a URL — use the fallback
    }
  }
  return fallback.endsWith('/') ? fallback : `${fallback}/`;
}

/** The parts of a Stripe Checkout Session the credit decision depends on. */
export interface PaidSessionLike {
  id: string;
  payment_status: string | null;
  currency: string | null;
  amount_total: number | null;
  client_reference_id: string | null;
  metadata: Record<string, string> | null;
}

/**
 * How many tokens a completed Checkout Session buys, and for whom — or null if it must not be
 * credited: unpaid, not one of our packs, not USD, the amount doesn't match the pack, or the
 * session's two copies of the buyer (metadata and client_reference_id) disagree.
 */
export function tokenCreditFor(session: PaidSessionLike): { uid: string; tokens: TokenPack } | null {
  if (session.payment_status !== 'paid') return null;
  const uid = session.metadata?.uid;
  if (!uid || uid !== session.client_reference_id) return null;
  const tokens = Number(session.metadata?.tokens);
  if (!isTokenPack(tokens)) return null;
  if (session.currency !== 'usd' || session.amount_total !== tokens * USD_CENTS_PER_TOKEN) return null;
  return { uid, tokens };
}
