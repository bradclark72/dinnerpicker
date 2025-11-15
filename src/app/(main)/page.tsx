'use client';

import AuthButton from '@/components/auth-button';
import RestaurantFinder from '@/components/restaurant-finder';

export default function Home() {
  return (
    <>
      <AuthButton />
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8">
        <RestaurantFinder />
      </main>
    </>
  );
}
