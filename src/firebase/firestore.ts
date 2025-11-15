'use client';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '.';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

export function decrementSpins(userId: string) {
  if (!userId) {
    return;
  }
  const { firestore } = initializeFirebase();
  const userDocRef = doc(firestore, `users/${userId}`);
  const updateData = { picksUsed: increment(1) };

  // Use non-blocking update with proper error handling
  updateDoc(userDocRef, updateData)
    .catch((error) => {
      // Create and emit a rich, contextual error for debugging
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}
