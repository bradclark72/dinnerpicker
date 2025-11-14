'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig } from './config';
import { useUser } from './auth/use-user';
import { signIn, signUp, signOut } from './auth';

// This function initializes and returns the Firebase services
export function initializeFirebase() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  
  return { firebaseApp: app, firestore, auth };
}

// Helper to get the initialized app, useful in other modules
export function getFirebaseApp() {
    return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Re-export hooks and functions for easy import elsewhere
export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { useUser, signIn, signUp, signOut };
