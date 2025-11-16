// src/firebase/firestore/use-doc.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { DocumentReference, DocumentData } from 'firebase/firestore';
import { onSnapshot, getDoc } from 'firebase/firestore';

export function useDoc<T = DocumentData>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState<boolean>(!!ref);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!ref) return;
    try {
      const snap = await getDoc(ref);
      setData(snap.exists() ? (snap.data() as T) : null);
    } catch (e) {
      setError(e as Error);
    }
  }, [ref]);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setData(snap.exists() ? (snap.data() as T) : null);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [ref]);

  return { data, isLoading, error, refetch };
}
