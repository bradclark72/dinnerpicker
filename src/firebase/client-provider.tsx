// src/firebase/client-provider.tsx
'use client';

import React from 'react';
import { firebaseApp, auth, db } from './firebase';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={db}>
      {children}
    </FirebaseProvider>
  );
};
