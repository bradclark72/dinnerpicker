'use client';

import * as React from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/lib/types';
import { onAuthUserChanged } from '@/firebase/auth';
import { getUserProfile } from '@/firebase/firestore';

type AuthContextType = {
  user: (FirebaseUser & User) | null;
  loading: boolean;
};

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<(FirebaseUser & User) | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (authUser) => {
      if (authUser) {
        const userProfile = await getUserProfile(authUser.uid);
        if (userProfile) {
          setUser({ ...authUser, ...userProfile });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
