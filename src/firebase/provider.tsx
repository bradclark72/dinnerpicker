'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import {
  createContext,
  useContext,
  type PropsWithChildren,
  useState,
  useEffect,
} from 'react';
import { initializeFirebase } from '.';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

type FirebaseContextValue = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: PropsWithChildren) {
  const [value, setValue] = useState<FirebaseContextValue>({
    firebaseApp: null,
    auth: null,
    firestore: null,
  });

  useEffect(() => {
    const { firebaseApp, auth, firestore } = initializeFirebase();
    setValue({ firebaseApp, auth, firestore });
  }, []);

  return (
    <FirebaseContext.Provider value={value}>
      {children}
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
    </FirebaseContext.Provider>
  );
}

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.firebaseApp;
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
};
