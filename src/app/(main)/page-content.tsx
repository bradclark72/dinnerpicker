'use client';

import RestaurantFinder from '@/components/restaurant-finder';

function PageContent() {
    return (
        <>
            <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
                <RestaurantFinder />
            </main>
        </>
    )
}

export default PageContent;
