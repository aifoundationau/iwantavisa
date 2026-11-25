/**
 * Supporter tokens: 1 token = US$1, bought in packs of 10, 50 or 100, and they never expire.
 *
 * Payment runs on Stripe Checkout. The createTokenCheckout Cloud Function (functions/) creates the
 * checkout with the Stripe secret key, which never reaches the browser; the stripeWebhook function
 * credits tokenWallets/{uid} only after Stripe confirms the payment. firestore.rules let people read
 * their own wallet and nobody but the server write it.
 */
import { doc, onSnapshot, type Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseErrorCode } from './auth';
import { appFirestore, firebaseApp } from './firebase';

export const TOKEN_PACKS = [10, 50, 100] as const;
export type TokenPack = (typeof TOKEN_PACKS)[number];
export const USD_PER_TOKEN = 1;

export function isTokenPack(value: unknown): value is TokenPack {
  return typeof value === 'number' && (TOKEN_PACKS as readonly number[]).includes(value);
}

export const tokenPackPriceUsd = (pack: TokenPack): number => pack * USD_PER_TOKEN;

export interface TokenWallet {
  balance: number;
  /** When the server recorded the supporter (their first Google log-in), if it has. */
  supporterSince: string | null;
}

/** Reads a tokenWallets document; a missing or malformed one is an empty wallet. */
export function parseTokenWallet(data: unknown): TokenWallet {
  const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
  const balance =
    typeof record.balance === 'number' && Number.isFinite(record.balance) && record.balance > 0
      ? Math.floor(record.balance)
      : 0;
  const since = record.supporterSince as Partial<Timestamp> | undefined;
  return {
    balance,
    supporterSince: typeof since?.toDate === 'function' ? since.toDate().toISOString() : null,
  };
}

/** Live balance for a signed-in supporter. */
export function watchTokenWallet(
  uid: string,
  onChange: (wallet: TokenWallet) => void,
  onError: (error: unknown) => void
): () => void {
  const db = appFirestore();
  if (!db) {
    onError(new Error('Firebase is not configured'));
    return () => {};
  }
  return onSnapshot(
    doc(db, 'tokenWallets', uid),
    (snapshot) => onChange(parseTokenWallet(snapshot.exists() ? snapshot.data() : null)),
    onError
  );
}

// ---- Stripe Checkout round trip ----

/** Stripe sends people back to ?tokens=success&session_id=… or ?tokens=cancelled. */
export const CHECKOUT_RETURN_PARAM = 'tokens';
export type CheckoutReturn = 'success' | 'cancelled';

export function parseCheckoutReturn(href: string): CheckoutReturn | null {
  const value = new URL(href).searchParams.get(CHECKOUT_RETURN_PARAM);
  return value === 'success' || value === 'cancelled' ? value : null;
}

/** The same address without the checkout parameters (so a reload doesn't repeat the notice). */
export function stripCheckoutReturn(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(CHECKOUT_RETURN_PARAM);
  url.searchParams.delete('session_id');
  return url.toString();
}

/** Only ever send people to Stripe's own hosted checkout. */
export function isStripeCheckoutUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'checkout.stripe.com';
  } catch {
    return false;
  }
}

/** Where Stripe returns to: this site (same origin keeps the Google log-in), at the app's base path. */
function checkoutReturnBase(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href;
}

/** Asks the server for a Stripe Checkout page for one pack; resolves to its URL. */
export async function createTokenCheckout(tokens: TokenPack): Promise<string> {
  if (!firebaseApp) throw Object.assign(new Error('Firebase is not configured'), { code: 'checkout/unavailable' });
  const call = httpsCallable<{ tokens: number; returnUrl: string }, { url?: unknown }>(
    getFunctions(firebaseApp),
    'createTokenCheckout'
  );
  const { data } = await call({ tokens, returnUrl: checkoutReturnBase() });
  if (!isStripeCheckoutUrl(data?.url)) {
    throw Object.assign(new Error('The server returned an unexpected checkout link'), { code: 'checkout/bad-url' });
  }
  return data.url;
}

/** A message for the person; technical detail goes to the console for whoever runs the site. */
export function describeCheckoutError(error: unknown): string {
  const code = firebaseErrorCode(error);
  switch (code) {
    case 'functions/unauthenticated':
      return 'Log in with Google to buy tokens.';
    case 'functions/invalid-argument':
      return 'Choose a pack of 10, 50 or 100 tokens.';
    case 'functions/unavailable':
    case 'functions/deadline-exceeded':
      return 'Network problem — check your connection and try again.';
    case 'functions/not-found':
    case 'functions/internal':
    case 'functions/unimplemented':
    case 'functions/failed-precondition':
    case 'checkout/unavailable':
      console.warn(
        '[iwantavisa] Token checkout unavailable — deploy the Cloud Functions in functions/ and set the STRIPE_SECRET_KEY secret.',
        error
      );
      return 'Buying tokens isn’t available yet — please try again later.';
    default:
      console.warn('[iwantavisa] Token checkout failed', error);
      return 'Couldn’t open the secure Stripe checkout — please try again.';
  }
}
