/**
 * Firebase app for project ai-foundation-firebase (config from VITE_FIREBASE_* in .env.local):
 * Auth (Google sign-in), Firestore (named database VITE_FIREBASE_DATABASE_ID), Cloud Functions
 * (token checkout) and — in production builds only — Analytics.
 */
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getFirestore, type Firestore } from 'firebase/firestore';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

/** null when the VITE_FIREBASE_* variables aren't set (the app then runs on in-memory demo data). */
export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

/** The named Firestore database the persistence phase will use ("iwantavisa"). */
export const firestoreDatabaseId = env.VITE_FIREBASE_DATABASE_ID || '(default)';

let firestore: Firestore | null = null;
/** Firestore for the named database, or null without Firebase config. Access is set by firestore.rules. */
export function appFirestore(): Firestore | null {
  if (!firebaseApp) return null;
  firestore ??=
    firestoreDatabaseId === '(default)'
      ? getFirestore(firebaseApp)
      : getFirestore(firebaseApp, firestoreDatabaseId);
  return firestore;
}

/**
 * Google Analytics — production builds only, so local development and automated test runs don't
 * send traffic to the real property. Add a privacy notice / consent before launch.
 */
export async function initAnalytics(): Promise<Analytics | null> {
  if (env.DEV || !firebaseApp || !firebaseConfig.measurementId) return null;
  try {
    return (await isSupported()) ? getAnalytics(firebaseApp) : null;
  } catch {
    return null; // blocked by an extension or unsupported environment
  }
}
