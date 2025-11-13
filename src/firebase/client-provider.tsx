'use client';
import { UserProvider } from './auth/use-user';

export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};
