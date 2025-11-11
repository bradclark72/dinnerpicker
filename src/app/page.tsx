'use client';

import RestaurantFinder from '@/components/restaurant-finder';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function Home() {
  const apiKey = 'AIzaSyCkGePqEnaQBUj5g2Ia6_vxKQiWRrboJrQ';

  return (
    <APIProvider apiKey={apiKey}>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
        <RestaurantFinder />
      </main>
    </APIProvider>
  );
}
