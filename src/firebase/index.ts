
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY initializeFirebase() behavior in production hosts
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp: FirebaseApp;
    try {
      // In hosting, initializeApp() may be called without args to let the environment inject config.
      firebaseApp = initializeApp();
    } catch (e) {
      // Fall back to explicit config in development
      if (process.env.NODE_ENV === 'production') {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  return {
    firebaseApp,
    auth,
    db,
  };
}

// Ensure module-level initialization so other modules can import `db` / `auth` directly.
const sdks = initializeFirebase();

// Export module-level instances
export const firebaseApp = sdks.firebaseApp;
export const auth: Auth = sdks.auth;
export const db: Firestore = sdks.db;

// === Explicit named exports to avoid conflicting star-exports ===
// Auth exports
export { useUser } from './auth/use-user';

// Provider exports
export {
  FirebaseProvider,
  useFirebase,
  useAuth, // ✅ Export with original name
  useAuth as useAuthFromProvider,
  useFirestore,
  useFirebaseApp,
} from './provider';

// Other exports
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
