// src/firebase/provider.tsx
'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  DependencyList,
  useCallback,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, firebaseApp, firestore, auth }) => {
  const [userState, setUserState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, isUserLoading: false, userError: new Error('Auth service not provided') });
      return;
    }
    setUserState({ user: null, isUserLoading: true, userError: null });
    const unsub = onAuthStateChanged(
      auth,
      (u) => setUserState({ user: u, isUserLoading: false, userError: null }),
      (err) => setUserState({ user: null, isUserLoading: false, userError: err as Error })
    );
    return () => unsub();
  }, [auth]);

  const value = useMemo<FirebaseContextState>(() => {
    const ok = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: ok,
      firebaseApp: ok ? firebaseApp : null,
      firestore: ok ? firestore : null,
      auth: ok ? auth : null,
      user: userState.user,
      isUserLoading: userState.isUserLoading,
      userError: userState.userError,
    };
  }, [firebaseApp, firestore, auth, userState]);

  return (
    <FirebaseContext.Provider value={value}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/* ---------- Hooks exported from provider ---------- */

export const useFirebase = (): FirebaseServicesAndUser => {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirebase must be used inside FirebaseProvider');
  if (!ctx.areServicesAvailable || !ctx.firebaseApp || !ctx.firestore || !ctx.auth) {
    throw new Error('Firebase core services not available. Check provider props.');
  }
  return {
    firebaseApp: ctx.firebaseApp,
    firestore: ctx.firestore,
    auth: ctx.auth,
    user: ctx.user,
    isUserLoading: ctx.isUserLoading,
    userError: ctx.userError,
  };
};

export const useAuth = () => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = () => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = () => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

/* helper to memoize firebase objects if needed */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}
