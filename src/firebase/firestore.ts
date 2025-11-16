'use client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '.';

export async function decrementSpins(userId: string) {
  if (!userId) {
    return;
  }
  
  try {
    const { db: firestore } = initializeFirebase();
    const userDocRef = doc(firestore, `users/${userId}`);
    
    // Get current picksUsed value
    const userDoc = await getDoc(userDocRef);
    const currentPicks = userDoc.data()?.picksUsed || 0;
    
    // Use setDoc with merge to update
    await setDoc(userDocRef, {
      picksUsed: currentPicks + 1,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('Decremented spins for user:', userId);
  } catch (error) {
    console.error('Failed to decrement spins:', error);
    // Don't throw - let the app continue even if update fails
  }
}