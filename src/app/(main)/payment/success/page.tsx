'use client';

import { useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function SuccessPage() {
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (!user) return;
    const uid = user.uid ?? (user as any).id;
    if (!uid) return;

    const userRef = doc(db, 'users', uid);
    updateDoc(userRef, { isPremium: true }).catch((err) => {
      console.error('Failed to mark user as premium:', err);
    });
  }, [user, db]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      <p>Your account has been upgraded to premium.</p>
    </div>
  );
}
