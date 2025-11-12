'use client';

import { PropsWithChildren } from 'react';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: PropsWithChildren) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
