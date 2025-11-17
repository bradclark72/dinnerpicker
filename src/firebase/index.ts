// src/firebase/index.ts
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Initialize Firebase once and return SDKs.
 * Uses the safe pattern: initialize with firebaseConfig when no app exists.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    return getSdks(app);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  return { firebaseApp, auth, db };
}

const sdks = initializeFirebase();

export const firebaseApp = sdks.firebaseApp;
export const auth: Auth = sdks.auth;
export const db: Firestore = sdks.db;

/**
 * Barrel exports
 * - Provider and hooks exposed here for `import { useAuth, useFullUser } from '@/firebase'`
 */
export { FirebaseProvider } from './provider';
export {
  useFirebase,
  useAuth,
  useFirestore,
  useFirebaseApp,
} from './provider';

export { useFullUser as useUser } from './auth/use-user';

export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
