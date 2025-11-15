'use client';
import { doc, getFirestore, increment, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '.';

export async function decrementSpins(userId: string) {
  if (!userId) {
    return;
  }
  const { firestore } = initializeFirebase();
  const userDocRef = doc(firestore, `users/${userId}`);

  try {
    const batch = writeBatch(firestore);
    batch.update(userDocRef, {
      picksUsed: increment(1),
    });
    await batch.commit();
  } catch (error) {
    console.error('Error decrementing spins:', error);
  }
}
