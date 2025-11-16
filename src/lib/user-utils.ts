'use client';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

export async function ensureUserDoc(db: Firestore, uid: string, email: string | null = null) {
  if (!uid) {
    console.error('ensureUserDoc called with no UID.');
    return;
  }
  
  const userRef = doc(db, 'users', uid);
  
  // Check if document already exists
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Create new user document
    try {
      await setDoc(userRef, {
        id: uid, // Use id to match security rules
        email: email || '',
        picksUsed: 0,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Created new user doc for:', uid);
    } catch (error) {
       console.error('Failed to create user document:', error);
       // Re-throw or handle as needed, for now just logging.
    }
  } else {
    console.log('User doc already exists for:', uid);
  }
}
