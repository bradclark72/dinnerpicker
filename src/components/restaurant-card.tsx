'use client';

import * as React from 'react';
import type { Restaurant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Map, Marker } from '@vis.gl/react-google-maps';
import { MapPin, Phone, Star, Globe, Utensils } from 'lucide-react';

type RestaurantCardProps = {
  restaurant: Restaurant;
};

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-primary text-primary" />
        ))}
        {halfStar && <Star key="half" className="h-5 w-5 fill-primary text-primary" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-primary/30" />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in duration-700">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div>
                <CardDescription className="font-semibold text-primary">Your Culinary Destination</CardDescription>
                <CardTitle className="font-headline text-4xl">{restaurant.name}</CardTitle>
            </div>
            <Utensils className="h-10 w-10 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {restaurant.rating && (
                <div className="flex items-center gap-3">
                  <StarRating rating={restaurant.rating} />
                  <span className="text-muted-foreground font-medium">
                    {restaurant.rating.toFixed(1)} ({restaurant.user_ratings_total} reviews)
                  </span>
                </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-1 text-accent flex-shrink-0" />
              <p className="text-foreground">{restaurant.address}</p>
            </div>
            {restaurant.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <a href={`tel:${restaurant.phone}`} className="text-foreground hover:underline">
                  {restaurant.phone}
                </a>
              </div>
            )}
            {restaurant.website && (
                <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-accent flex-shrink-0" />
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline truncate">
                        Visit Website
                    </a>
                </div>
            )}
          </div>
          <div className="rounded-lg overflow-hidden h-48 md:h-full w-full border">
             <Map
                defaultCenter={restaurant.location}
                defaultZoom={15}
                gestureHandling={'none'}
                disableDefaultUI={true}
                mapId="e7c8f237209196b"
                >
                <Marker position={restaurant.location} />
             </Map>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row justify-end gap-4">
        <Button asChild>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.place_id}`} target="_blank" rel="noopener noreferrer">
                <MapPin className="mr-2 h-4 w-4" />
                Get Directions
            </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
