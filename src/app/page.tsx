'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import PageContent from '@/app/(main)/page-content';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="text-destructive">
            Google Maps API key is missing.
          </p>
          <p className="text-muted-foreground">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.
          </p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <FirebaseClientProvider>
        <PageContent />
      </FirebaseClientProvider>
    </APIProvider>
  );
}
