'use client';
import { doc, setDoc, getDoc, Firestore, increment } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function decrementSpins(db: Firestore, userId: string) {
  if (!userId) {
    console.error('decrementSpins called with no userId');
    return;
  }
  
  const userDocRef = doc(db, `users/${userId}`);
  const updateData = {
    picksUsed: increment(1)
  };

  // Use setDoc with merge to update. This is non-blocking.
  setDoc(userDocRef, updateData, { merge: true })
    .catch((error) => {
      // Create and emit a rich, contextual error for debugging
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
      console.error('Failed to decrement spins due to permission error:', error);
    });
}
