import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export async function ensureUserProfile(uid: string, email: string) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      id: uid,
      email: email || '',
      picksUsed: 0,
      isPremium: false,
      createdAt: new Date().toISOString(),
    });
  }
}
