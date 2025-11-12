'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/errors';
import { AuthProvider } from '@/hooks/use-auth';
import AuthButton from '@/components/auth-button';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    useEffect(() => {
        const handlePermissionError = (error: any) => {
            console.error(error);
        };
        errorEmitter.on('permission-error', handlePermissionError);
        return () => {
            errorEmitter.off('permission-error', handlePermissionError);
        };
    }, [router]);

    return (
        <AuthProvider>
            <header className="fixed top-0 right-0 p-4">
                <AuthButton />
            </header>
            <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 md:p-8">
                {children}
            </main>
        </AuthProvider>
    );
}
