// src/firebase/index.ts
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY initializeFirebase() behaviour in production hosts
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp: FirebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

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

// module-level initialization
const sdks = initializeFirebase();

export const firebaseApp = sdks.firebaseApp;
export const auth: Auth = sdks.auth;
export const db: Firestore = sdks.db;

// Explicit exports to avoid conflicting star-exports
export { useUser } from './auth/use-user';
export { UserProvider } from './provider';

export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
