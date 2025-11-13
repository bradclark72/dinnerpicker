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

export type UserData = FirebaseUser & User;

export type UseUser = {
  data: UserData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

const UserContext = createContext<UseUser | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    onAuthUserChanged(async (authUser) => {
      if (authUser) {
        try {
          const userProfile = await getUserProfile(authUser.uid);
          if (userProfile) {
            setUser({ ...authUser, ...userProfile });
          } else {
            setUser(null);
          }
        } catch (e: any) {
          setError(e);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    data: user,
    isLoading,
    error,
    refetch: fetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
