// src/firebase/hooks.ts
'use client';

import { useContext } from 'react';
import { FirebaseContext, FirebaseContextState } from './provider';

// Re-export main user hook
export { useUser } from './auth/use-user';
export type { User, UseUserResult } from './auth/use-user';

// Re-export collection/doc hooks
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

// Context Hooks
const useFirebaseContext = (): FirebaseContextState => {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirebaseContext must be used inside FirebaseProvider');
  return ctx;
};

export const useAuth = () => {
  const { auth } = useFirebaseContext();
  return auth;
};

export const useFirestore = () => {
  const { firestore } = useFirebaseContext();
  return firestore;
};

export const useFirebaseApp = () => {
  const { firebaseApp } = useFirebaseContext();
  return firebaseApp;
};
