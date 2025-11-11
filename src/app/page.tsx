'use client';

import RestaurantFinder from '@/components/restaurant-finder';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
        <p className="text-destructive">
          Google Maps API key is missing. Please add it to your environment variables.
        </p>
      </main>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
        <RestaurantFinder />
      </main>
    </APIProvider>
  );
}
