'use client';

import RestaurantFinder from '@/components/restaurant-finder';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { user, loading } = useAuth();

  if (!apiKey) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
        <p className="text-destructive">
          Google Maps API key is missing.
        </p>
        <p className="text-muted-foreground">
          Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.
        </p>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <RestaurantFinder user={user} loading={loading} />
    </APIProvider>
  );
}
