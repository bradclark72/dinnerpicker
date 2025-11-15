
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  } else {
    firebaseApp = getApp();
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }

  return {
    firebaseApp,
    auth,
    db,
  };
}

// === Explicit named exports to avoid conflicting star-exports ===
// Auth exports
export { useUser } from './auth/use-user';

// Provider exports
export {
  FirebaseProvider,
  useFirebase,
  useAuth,
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
