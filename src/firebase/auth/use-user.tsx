// src/firebase/auth/use-user.tsx
'use client';

import { useMemo, useCallback, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc } from 'firebase/firestore';

import { FirebaseContext } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { db } from '@/firebase/firebase';

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
export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUser(): UseUserResult {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }

  const { user: firebaseUser, isUserLoading, userError } = context;

  const userDocRef = useMemo(() => {
    if (!firebaseUser) return null;
    return doc(db, 'users', firebaseUser.uid);
  }, [firebaseUser]);

  const customerDocRef = useMemo(() => {
    if (!firebaseUser) return null;
    return doc(db, 'customers', firebaseUser.uid);
  }, [firebaseUser]);

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

  const loading = isUserLoading || (!!firebaseUser && (isLoadingFirestore || isLoadingCustomer));
  const error = userError || firestoreError || customerError;

  const refetch = useCallback(() => {
    if (refetchUser) refetchUser();
    if (refetchCustomer) refetchCustomer();
  }, [refetchUser, refetchCustomer]);

  return { user, loading, error: error ?? null, refetch };
}
