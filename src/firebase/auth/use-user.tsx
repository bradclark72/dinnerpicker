// src/firebase/auth/use-user.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirestore } from '@/firebase/provider';
import { useAuth } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { User as FirebaseUser } from 'firebase/auth';

/** App-level shapes */
interface AppUser {
  id: string;
  email?: string;
  picksUsed: number;
  isPremium: boolean;
}
interface CustomerData {
  stripeId?: string;
  stripeLink?: string;
}
export interface User extends AppUser, FirebaseUser, CustomerData {}

/** Hook return */
export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * useFullUser: merges Auth user + Firestore profile + customer doc
 */
export function useFullUser(): UseUserResult {
  const firestore = useFirestore();
  const auth = useAuth();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (u) => {
        setFirebaseUser(u);
        setIsLoadingAuth(false);
      },
      (err) => {
        setAuthError(err as Error);
        setIsLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const userDocRef = useMemo(() => {
    if (!firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser, refetchTrigger]);

  const customerDocRef = useMemo(() => {
    if (!firebaseUser) return null;
    return doc(firestore, 'customers', firebaseUser.uid);
  }, [firestore, firebaseUser, refetchTrigger]);

  const { data: firestoreUser, isLoading: isLoadingFirestore, error: firestoreError, refetch: refetchUser } = useDoc<AppUser>(userDocRef);
  const { data: customerData, isLoading: isLoadingCustomer, error: customerError, refetch: refetchCustomer } = useDoc<CustomerData>(customerDocRef);

  const user = useMemo(() => {
    if (!firebaseUser) return null;
    const merged: any = {
      ...firebaseUser,
      id: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      picksUsed: firestoreUser?.picksUsed ?? 0,
      isPremium: firestoreUser?.isPremium ?? false,
      ...(firestoreUser || {}),
      ...(customerData || {}),
    };
    return merged as User;
  }, [firebaseUser, firestoreUser, customerData]);

  const loading = isLoadingAuth || (!!firebaseUser && (isLoadingFirestore || isLoadingCustomer));
  const error = authError || firestoreError || customerError;

  const refetch = useCallback(() => {
    setRefetchTrigger((p) => p + 1);
    if (refetchUser) refetchUser();
    if (refetchCustomer) refetchCustomer();
  }, [refetchUser, refetchCustomer]);

  return { user, loading, error: error ?? null, refetch };
}
