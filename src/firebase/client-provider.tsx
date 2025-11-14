'use client';

import { FirebaseProvider } from './provider';
import { UserProvider } from './auth/use-user';
import { initializeFirebase } from './index';

// Initialize Firebase on the client
const { firebaseApp, firestore, auth } = initializeFirebase();

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      <UserProvider>{children}</UserProvider>
    </FirebaseProvider>
  );
}
