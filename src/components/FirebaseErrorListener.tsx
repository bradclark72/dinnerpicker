// src/components/FirebaseErrorListener.tsx
'use client';
import React, { useEffect } from 'react';
import { onFirebaseError } from '@/firebase/error-emitter';

export const FirebaseErrorListener: React.FC = () => {
  useEffect(() => {
    const unsub = onFirebaseError((err) => {
      console.error('Firebase error emitted:', err);
      // you could show a toast here
    });
    return unsub;
  }, []);
  return null;
};
