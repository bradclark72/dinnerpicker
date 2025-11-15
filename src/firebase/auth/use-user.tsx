
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirebase, useAuthFromProvider as useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { User as FirebaseUser } from 'firebase/auth';

// Define the shape of your user data in Firestore
interface AppUser {
  id: string;
  email?: string;
  picksUsed: number;
  isPremium: boolean;
}

// Define the shape of the user object returned by the hook
export interface User extends AppUser, FirebaseUser {}

export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get the current user's auth state and Firestore data.
 * @returns {UseUserResult} The user object, loading state, and error.
 */
export function useUser(): UseUserResult {
  const { firestore } = useFirebase();
  const auth = useAuth();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setFirebaseUser(user);
        setIsLoadingAuth(false);
      },
      (error) => {
        setAuthError(error);
        setIsLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const userDocRef = useMemo(() => {
    if (!firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser, refetchTrigger]);

  const { data: firestoreUser, isLoading: isLoadingFirestore, error: firestoreError } = useDoc<AppUser>(userDocRef);

  const user = useMemo((): User | null => {
    if (!firebaseUser) return null;
    
    // If we have Firestore data, merge it. Otherwise, use defaults.
    const mergedUser: User = {
      ...firebaseUser,
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      picksUsed: firestoreUser?.picksUsed ?? 0,
      isPremium: firestoreUser?.isPremium ?? false,
      ...firestoreUser, // This will overwrite the defaults if firestoreUser is not null
    };
    return mergedUser;
  }, [firebaseUser, firestoreUser]);

  const loading = isLoadingAuth || (firebaseUser != null && isLoadingFirestore);
  const error = authError || firestoreError;

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };
  
  return { user, loading, error, refetch };
}
