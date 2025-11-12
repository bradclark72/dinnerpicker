'use client';

import RestaurantFinder from '@/components/restaurant-finder';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="text-destructive">
            Google Maps API key is missing.
          </p>
          <p className="text-muted-foreground">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.
          </p>
        </div>
      </main>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 md:p-8">
        <RestaurantFinder />
      </main>
    </APIProvider>
  );
}
