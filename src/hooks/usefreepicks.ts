// src/hooks/useFreePicks.ts
'use client';

import { useState, useCallback } from 'react';
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useFullUser } from '@/firebase'; // your merged user hook
import type { FirestoreError } from 'firebase/firestore';

const DEFAULT_FREE_PICKS = 3;

export function useFreePicks({ freeLimit = DEFAULT_FREE_PICKS } = {}) {
  const { user, loading: userLoading, error: userError, refetch } = useFullUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const picksUsed = user?.picksUsed ?? 0;
  const isPremium = user?.isPremium ?? false;
  const remaining = isPremium ? Infinity : Math.max(0, freeLimit - picksUsed);
  const outOfPicks = !isPremium && remaining === 0;

  const usePick = useCallback(async () => {
    if (!user) {
      setError(new Error('Not signed in'));
      return { ok: false, reason: 'no-user' } as const;
    }
    if (isPremium) {
      return { ok: true, reason: 'premium' } as const;
    }
    if (outOfPicks) {
      return { ok: false, reason: 'out-of-picks' } as const;
    }

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', user.id);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) {
          // Create base document if missing
          tx.set(userRef, {
            email: user.email ?? '',
            picksUsed: 1,
            isPremium: false,
            createdAt: new Date(),
          });
          return;
        }
        const current = snap.data();
        const currentUsed = typeof current?.picksUsed === 'number' ? current.picksUsed : 0;
        tx.update(userRef, { picksUsed: currentUsed + 1 });
      });

      // Refetch merged user data so UI updates
      if (refetch) refetch();

      setLoading(false);
      return { ok: true, reason: 'incremented' } as const;
    } catch (err) {
      setLoading(false);
      setError(err as Error);
      console.error('useFreePicks: transaction failed', err);
      return { ok: false, reason: 'error', error: err } as const;
    }
  }, [user?.id, isPremium, outOfPicks, refetch]);

  const promptUpgrade = () => {
    // UI can show modal — we return a function for the consumer to call
    // Consumer implements modal logic
  };

  return {
    remaining,
    isPremium,
    picksUsed,
    outOfPicks,
    loading,
    error,
    userLoading,
    userError,
    usePick,
    promptUpgrade,
    refetch,
  } as const;
}
