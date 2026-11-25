/**
 * I Want A Visa — server side (Firebase Cloud Functions, project ai-foundation-firebase).
 *
 *  • onSupporterCreated  — a first Google log-in creates the Auth user → record the new supporter
 *                          with an empty token wallet (tokenWallets/{uid}).
 *  • createTokenCheckout — starts a Stripe Checkout for a pack of 10, 50 or 100 tokens (1 token = US$1).
 *  • stripeWebhook       — credits tokens only after Stripe confirms payment; Stripe retries are safe
 *                          (one credit per Checkout Session).
 *
 * Secrets live in Google Secret Manager — never in the web app, .env files or this repo:
 *   firebase functions:secrets:set STRIPE_SECRET_KEY       (sk_test_… / sk_live_…)
 *   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET   (whsec_… from the Stripe webhook endpoint)
 */
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as functionsV1 from 'firebase-functions/v1';
import { defineSecret, defineString } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import { isTokenPack, resolveReturnBase, tokenCreditFor, USD_CENTS_PER_TOKEN } from './tokenRules';

initializeApp();

/** The named Firestore database the web app uses. */
const db = getFirestore('iwantavisa');

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const APP_URL = defineString('APP_URL', { default: 'https://www.iwantavisa.com/' });

/** First Google log-in → the person becomes a supporter with an empty, never-expiring wallet. */
export const onSupporterCreated = functionsV1.auth.user().onCreate(async (user) => {
  try {
    // create() never overwrites, so a wallet the webhook already credited can't be reset.
    await db.doc(`tokenWallets/${user.uid}`).create({
      uid: user.uid,
      balance: 0,
      supporterSince: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 6 /* ALREADY_EXISTS */) throw error;
  }
});

/** Starts a Stripe Checkout for one pack; returns the hosted checkout page's URL. */
export const createTokenCheckout = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Log in with Google to buy tokens.');
  const data = (request.data ?? {}) as { tokens?: unknown; returnUrl?: unknown };
  const tokens = Number(data.tokens);
  if (!isTokenPack(tokens)) throw new HttpsError('invalid-argument', 'Choose a pack of 10, 50 or 100 tokens.');

  const uid = request.auth.uid;
  const appBase = resolveReturnBase(data.returnUrl, APP_URL.value());
  const email = request.auth.token.email;

  const stripe = new Stripe(STRIPE_SECRET_KEY.value());
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: uid,
    ...(typeof email === 'string' ? { customer_email: email } : {}),
    line_items: [
      {
        quantity: tokens,
        price_data: {
          currency: 'usd',
          unit_amount: USD_CENTS_PER_TOKEN,
          product_data: {
            name: 'I Want A Visa supporter token',
            description: '1 token = US$1 · tokens never expire',
          },
        },
      },
    ],
    metadata: { uid, tokens: String(tokens) },
    payment_intent_data: { metadata: { uid, tokens: String(tokens) } },
    success_url: `${appBase}?tokens=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appBase}?tokens=cancelled`,
  });
  if (!session.url) throw new HttpsError('internal', 'Stripe did not return a checkout page.');
  return { url: session.url };
});

/** Stripe → us: credit tokens once a checkout is paid (signature-verified, idempotent). */
export const stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        String(req.headers['stripe-signature'] ?? ''),
        STRIPE_WEBHOOK_SECRET.value()
      );
    } catch {
      res.status(400).send('Invalid Stripe signature');
      return;
    }

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const credit = tokenCreditFor(session);
      if (credit) await creditTokens(session.id, credit.uid, credit.tokens);
    }
    res.json({ received: true });
  }
);

async function creditTokens(checkoutSessionId: string, uid: string, tokens: number): Promise<void> {
  const purchaseRef = db.doc(`tokenPurchases/${checkoutSessionId}`);
  const walletRef = db.doc(`tokenWallets/${uid}`);
  await db.runTransaction(async (tx) => {
    if ((await tx.get(purchaseRef)).exists) return; // already credited (Stripe retried)
    tx.set(purchaseRef, {
      uid,
      tokens,
      amountUsd: tokens,
      stripeCheckoutSessionId: checkoutSessionId,
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.set(
      walletRef,
      { uid, balance: FieldValue.increment(tokens), updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  });
}
