'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { type FirestorePermissionError } from '@/firebase/errors';

// This component is responsible for catching Firestore permission errors
// and throwing them as uncaught exceptions so they can be picked up by the
// Next.js error overlay. This is for development purposes only.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Throw the error so Next.js can display it in the error overlay.
      // This is for development convenience and should not be used in production
      // without a proper error boundary.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
