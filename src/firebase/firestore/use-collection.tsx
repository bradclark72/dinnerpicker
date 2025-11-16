// src/firebase/firestore/use-collection.ts
'use client';

import { useEffect, useState } from 'react';
import type { Query, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setLoading] = useState<boolean>(!!query);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      query,
      (snap) => {
        setData(snap.docs.map((d) => d.data() as T));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [query]);

  return { data, isLoading, error };
}
