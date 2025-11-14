'use client';

import AuthButton from '@/components/auth-button';
import RestaurantFinder from '@/components/restaurant-finder';
import { useUser } from '@/firebase';

function PageContent() {
    const {data: user, isLoading} = useUser();
    return (
        <>
            <header className="fixed top-0 right-0 p-4 z-20">
                <AuthButton />
            </header>
            <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
                <RestaurantFinder user={user} loading={isLoading} />
            </main>
        </>
    )
}

export default PageContent;
