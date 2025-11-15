// src/app/(main)/payment/success/page.tsx
'use client';

import { useEffect } from 'react';
import { db, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function SuccessPage() {
  const { user } = useUser();

  useEffect(() => {
    // If user is not available yet, do nothing. This runs client-side once auth resolves.
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    // Best-effort: try to set isPremium = true. Errors will be visible in console for debugging.
    updateDoc(userRef, { isPremium: true }).catch((err) => {
      // Log error for debugging (e.g. permission issues or missing doc)
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
