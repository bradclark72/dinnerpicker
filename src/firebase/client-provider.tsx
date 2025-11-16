'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const { firebaseApp, auth, db } = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    const { firebaseApp, auth, db } = initializeFirebase();
    return { firebaseApp, auth, db };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={db}
    >
      {children}
    </FirebaseProvider>
  );
}
