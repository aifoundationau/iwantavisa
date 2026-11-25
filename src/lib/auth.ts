/**
 * People sign in with Google (Firebase Auth). Set VITE_AUTH_MODE=demo to use the password-less
 * demo accounts instead (automated tests, or before Firebase is configured).
 */
import {
  connectAuthEmulator,
  getAdditionalUserInfo,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseApp } from './firebase';

/**
 * A Google account signed in to the site. Logging in with Google makes the person a supporter at
 * once: the Firebase Auth user created at their first log-in is the record (Firebase console →
 * Authentication → Users), so it works before any database or server is set up.
 */
export interface GoogleAccount {
  uid: string;
  name: string;
  email: string;
  /** ISO time of their first Google log-in here — when they became a supporter. */
  supporterSince: string;
}

export interface GoogleSignIn {
  account: GoogleAccount;
  /** True on the person's first ever Google log-in (they just became a supporter). */
  isNewSupporter: boolean;
}

export const authMode: 'google' | 'demo' =
  firebaseApp && import.meta.env.VITE_AUTH_MODE !== 'demo' ? 'google' : 'demo';

let auth: Auth | null = null;
function appAuth(): Auth {
  if (!firebaseApp) throw new Error('Firebase is not configured');
  if (!auth) {
    auth = getAuth(firebaseApp);
    // Local testing only (never in production builds): the Firebase Auth emulator, started with
    // `firebase emulators:start --only auth`, signs in stand-in Google accounts.
    const emulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL;
    if (import.meta.env.DEV && emulatorUrl) connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true });
  }
  return auth;
}

function toIsoTime(value: string | undefined): string | null {
  if (!value) return null;
  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? null : time.toISOString();
}

const toAccount = (user: User): GoogleAccount => ({
  uid: user.uid,
  name: user.displayName ?? '',
  email: (user.email ?? '').toLowerCase(),
  supporterSince: toIsoTime(user.metadata.creationTime) ?? new Date().toISOString(),
});

/** "Alex Mercer", or "alex" from alex@example.com when the Google profile has no name. */
export function googleDisplayName(account: GoogleAccount): string {
  return account.name.trim() || account.email.split('@')[0] || 'Supporter';
}

export async function signInWithGoogle(): Promise<GoogleSignIn> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(appAuth(), provider);
  return {
    account: toAccount(result.user),
    isNewSupporter: getAdditionalUserInfo(result)?.isNewUser ?? false,
  };
}

export async function signOutOfGoogle(): Promise<void> {
  if (authMode === 'google') await signOut(appAuth());
}

/** Reports the signed-in Google account now (restored sessions included) and on every change. */
export function watchGoogleAccount(onChange: (account: GoogleAccount | null) => void): () => void {
  if (authMode !== 'google') return () => {};
  return onAuthStateChanged(appAuth(), (user) => onChange(user ? toAccount(user) : null));
}

/** The `code` of a Firebase error ("auth/popup-blocked", "functions/not-found"…), else ''. */
export function firebaseErrorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';
}

/** A message for the person, or null when they simply closed the Google window. */
export function describeAuthError(error: unknown): string | null {
  const code = firebaseErrorCode(error);
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null;
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window — allow pop-ups for this site and try again.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in isn’t switched on for this site yet (Firebase console → Authentication → Sign-in method → Google).';
    case 'auth/unauthorized-domain':
      return 'This web address isn’t authorised for Google sign-in yet (Firebase console → Authentication → Settings → Authorised domains).';
    case 'auth/network-request-failed':
      return 'Network problem — check your connection and try again.';
    case 'auth/web-storage-unsupported':
    case 'auth/operation-not-supported-in-this-environment':
      return 'This browser can’t sign in with Google. If you opened the link inside Telegram, Facebook or another app, open it in Chrome or Safari instead.';
    default:
      return 'Google sign-in didn’t work — please try again.';
  }
}
