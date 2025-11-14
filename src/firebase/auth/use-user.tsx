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

function createStore() {
  let state = {
    user: null as UserData | null,
    isLoading: true,
    error: null as Error | null,
  };
  const listeners = new Set<() => void>();

  const emitChange = () => listeners.forEach((l) => l());

  const setState = (
    updater: (
      prevState: typeof state
    ) => typeof state
  ) => {
    state = updater(state);
    emitChange();
  };

  const store = {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => state,
    fetchUser: async (authUser: FirebaseUser) => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const userProfile = await getUserProfile(authUser.uid);
        if (userProfile) {
          const userData = { ...authUser, ...userProfile };
          setState((s) => ({ ...s, user: userData, isLoading: false }));
        } else {
          throw new Error('User profile not found.');
        }
      } catch (e: any) {
        setState((s) => ({ ...s, user: null, error: e, isLoading: false }));
      }
    },
    clearUser: () => {
      setState((s) => ({ ...s, user: null, isLoading: false, error: null }));
    },
    setLoading: (isLoading: boolean) => {
        setState(s => ({...s, isLoading}));
    }
  };

  return store;
}

let store: ReturnType<typeof createStore>;
function getStore() {
  if (!store) {
    store = createStore();
    onAuthUserChanged(async (authUser) => {
      if (authUser) {
        await store.fetchUser(authUser);
      } else {
        store.clearUser();
      }
    });
  }
  return store;
}


export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const store = getStore();
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const refetch = useCallback(async () => {
    const auth = (await import('@/firebase/auth')).auth;
    if(auth.currentUser){
        store.setLoading(true);
        await store.fetchUser(auth.currentUser);
    }
  }, []);

  const value: UseUser = {
    data: state.user,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
