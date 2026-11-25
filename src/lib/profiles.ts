/**
 * Registered people in Firestore: userProfiles/{uid} in the named database (VITE_FIREBASE_DATABASE_ID).
 * Owner-only access is enforced by firestore.rules — deploy them before relying on this.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types/contracts';
import { appFirestore as database } from './firebase';

function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Partial<UserProfile>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.email === 'string' &&
    (p.role === 'traveller' || p.role === 'merchant') &&
    typeof p.location?.label === 'string'
  );
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const store = database();
  if (!store) return null;
  const snapshot = await getDoc(doc(store, 'userProfiles', uid));
  const data = snapshot.exists() ? snapshot.data() : null;
  return isUserProfile(data) ? data : null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const store = database();
  if (!store) return;
  // Firestore rejects undefined values; optional fields are simply omitted.
  await setDoc(doc(store, 'userProfiles', profile.id), JSON.parse(JSON.stringify(profile)));
}
