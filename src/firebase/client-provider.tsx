// src/firebase/client-provider.tsx
'use client';

import React from 'react';
import { firebaseApp, auth, db } from './index';
import { FirebaseProvider } from './provider';

/**
 * Convenience wrapper to provide the default initialized SDKs at top-level.
 * Use in app/layout.tsx (client component) like:
 * <FirebaseClientProvider>{children}</FirebaseClientProvider>
 */
export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
};
