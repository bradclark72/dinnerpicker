import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export async function ensureUserDoc(uid: string, email: string | null = null) {
  const userRef = doc(db, 'users', uid);
  
  // Check if document already exists
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Create new user document
    await setDoc(userRef, {
      uid: uid,
      email: email || '',
      membership: 'free',
      picksUsed: 0,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created new user doc for:', uid);
  } else {
    console.log('User doc already exists for:', uid);
  }
}