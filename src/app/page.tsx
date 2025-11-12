'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
            <p>Loading...</p>
        </main>
    );
}
