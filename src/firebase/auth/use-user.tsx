'use client';
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
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

let userStore: {
  user: UserData | null;
  isLoading: boolean;
  error: Error | null;
  listeners: (() => void)[];
  setUser(user: UserData | null): void;
  setLoading(loading: boolean): void;
  setError(error: Error | null): void;
  subscribe(listener: () => void): () => void;
};

function initializeUserStore() {
  let user: UserData | null = null;
  let isLoading = true;
  let error: Error | null = null;
  const listeners = new Set<() => void>();

  const store = {
    getSnapshot: () => ({ user, isLoading, error }),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emitChange: () => {
      for (const listener of listeners) {
        listener();
      }
    },
  };

  onAuthUserChanged(async (authUser) => {
    isLoading = true;
    error = null;
    store.emitChange();

    if (authUser) {
      try {
        const userProfile = await getUserProfile(authUser.uid);
        if (userProfile) {
          user = { ...authUser, ...userProfile };
        } else {
          // This case might happen if firestore record creation fails after signup
          user = null;
        }
      } catch (e: any) {
        error = e;
        user = null;
      }
    } else {
      user = null;
    }
    isLoading = false;
    store.emitChange();
  });
  
  return store;
}

let store: ReturnType<typeof initializeUserStore>;
function getStore() {
  if (!store) {
    store = initializeUserStore();
  }
  return store;
}


export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const store = getStore();
  const { user, isLoading, error } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const refetch = useCallback(() => {
    // Re-trigger the auth check
    onAuthUserChanged(async (authUser) => {
      if (authUser) {
        const userProfile = await getUserProfile(authUser.uid);
        if (userProfile) {
          getStore().getSnapshot().user = { ...authUser, ...userProfile };
        }
      } else {
        getStore().getSnapshot().user = null;
      }
      getStore().emitChange();
    });
  }, []);

  const value: UseUser = {
    data: user,
    isLoading,
    error,
    refetch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
