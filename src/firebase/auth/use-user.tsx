'use client';
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthUserChanged } from '@/firebase/auth';
import { getUserProfile } from '@/firebase/firestore';
import type { User } from '@/lib/types';
import { getAuth } from 'firebase/auth';

export type UserData = FirebaseUser & User;

export type UseUser = {
  data: UserData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

const UserContext = createContext<UseUser | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFullUser = useCallback(async (authUser: FirebaseUser | null) => {
    setIsLoading(true);
    if (!authUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userProfile = await getUserProfile(authUser.uid);
      if (userProfile) {
        setUser({ ...authUser, ...userProfile });
      } else {
        // This can happen briefly during signup before firestore doc is created.
        // We'll rely on the refetch mechanism or a subsequent auth state change.
         setUser(null);
      }
    } catch (e: any) {
      setError(e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged(fetchFullUser);
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchFullUser]);

  const refetch = useCallback(async () => {
    const auth = getAuth();
    await fetchFullUser(auth.currentUser);
  }, [fetchFullUser]);

  const value: UseUser = {
    data: user,
    isLoading,
    error,
    refetch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
