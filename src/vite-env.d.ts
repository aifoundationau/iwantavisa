/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Canonical public origin used in share links, e.g. https://www.iwantavisa.com */
  readonly VITE_APP_DOMAIN?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  /** Named Firestore database, e.g. "iwantavisa". */
  readonly VITE_FIREBASE_DATABASE_ID?: string;
  /** Public Google OAuth client ID. Never add client secrets as VITE_ variables. */
  readonly VITE_OAUTH_CLIENT_ID?: string;
  /** "demo" = password-less demo accounts instead of Google sign-in (automated tests). */
  readonly VITE_AUTH_MODE?: string;
  /** imgbb API key for photo uploads (public in the bundle). */
  readonly VITE_IMGBB_API_KEY?: string;
  /** Development only: Firebase Auth emulator URL, e.g. http://127.0.0.1:9099 (ignored in builds). */
  readonly VITE_FIREBASE_AUTH_EMULATOR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
