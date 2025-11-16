'use client';

import { useEffect } from 'react';
import { db } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { doc, updateDoc } from 'firebase/firestore';

export default function SuccessPage() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    const uid = user.uid ?? user.id;
    if (!uid) return;

    const userRef = doc(db, 'users', uid);
    updateDoc(userRef, { isPremium: true }).catch((err) => {
      console.error('Failed to mark user as premium:', err);
    });
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      <p>Your account has been upgraded to premium.</p>
    </div>
  );
}
