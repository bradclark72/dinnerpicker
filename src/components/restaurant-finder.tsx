'use client';

import * as React from 'react';
import {
  Bean,
  Beef,
  Fish,
  Flame,
  Globe,
  Loader2,
  MapPin,
  Pizza,
  Soup,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { findRestaurant } from '@/app/actions';
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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import RestaurantCard from './restaurant-card';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

type Cuisine = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const cuisines: Cuisine[] = [
  { id: 'anything', name: 'Anything', icon: <Utensils className="h-5 w-5" /> },
  { id: 'european', name: 'European', icon: <Globe className="h-5 w-5" /> },
  { id: 'italian', name: 'Italian', icon: <Pizza className="h-5 w-5" /> },
  { id: 'mexican', name: 'Mexican', icon: <Bean className="h-5 w-5" /> },
  { id: 'american', name: 'American', icon: <Beef className="h-5 w-5" /> },
  { id: 'asian', name: 'Asian', icon: <Soup className="h-5 w-5" /> },
  { id: 'indian', name: 'Indian', icon: <Flame className="h-5 w-5" /> },
  { id: 'seafood', name: 'Seafood', icon: <Fish className="h-5 w-5" /> },
];

type ButtonState = "SIGN_UP" | "FREE_PICK" | "UPGRADE" | "UNLIMITED" | "LOADING";

export default function RestaurantFinder() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, refetch } = useUser();

  const [location, setLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = React.useState<string[]>(['Anything']);
  const [radius, setRadius] = React.useState([5]);
  const [isFinding, setIsFinding] = React.useState(false);
  const [foundRestaurant, setFoundRestaurant] = React.useState<Restaurant | null>(null);
  const [hasMounted, setHasMounted] = React.useState(false);
  const resultRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const requestLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      const message = 'Geolocation is not supported by your browser.';
      setLocationError(message);
      toast({
        variant: 'destructive',
        title: 'Compatibility Error',
        description: message,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        let message = 'An unknown error occurred while getting your location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Please enable location access in your browser to use this feature.';
        }
        setLocationError(message);
        toast({
          variant: 'destructive',
          title: 'Location Error',
          description: message,
        });
      }
    );
  }, [toast]);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          requestLocation();
        } else if (permissionStatus.state === 'denied') {
          setLocationError('Please enable location access in your browser to use this feature.');
        }
      });
    }
  }, [requestLocation]);

  React.useEffect(() => {
    if (foundRestaurant && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [foundRestaurant]);

  const handleCuisineToggle = (cuisineName: string) => {
    if (cuisineName === 'Anything') {
      setSelectedCuisines(['Anything']);
      return;
    }

    setSelectedCuisines((prev) => {
      let newCuisines;
      if (prev.includes(cuisineName)) {
        newCuisines = prev.filter((c) => c !== cuisineName);
      } else {
        newCuisines = [...prev.filter((c) => c !== 'Anything'), cuisineName];
      }
      if (newCuisines.length === 0) {
        return ['Anything'];
      }
      return newCuisines;
    });
  };

  // Helper: get uid robustly whether your useUser returns uid or id
  const getUid = () => {
    return (user as any)?.uid ?? (user as any)?.id ?? null;
  };

  const incrementPickCount = async (): Promise<void> => {
    const uid = getUid();
    if (!uid) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { picksUsed: increment(1) });
      // Refresh local user after update so UI shows new count
      if (typeof refetch === 'function') await refetch();
    } catch (err) {
      console.error('Failed to increment picksUsed:', err);
    }
  };

  const handleFindRestaurant = async () => {
    if (!location) {
      requestLocation();
      toast({
        variant: 'destructive',
        title: 'Location not ready',
        description: 'Please grant location access to find restaurants.',
      });
      return;
    }

    if (selectedCuisines.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Cuisine Selected',
        description: 'Please select at least one cuisine.',
      });
      return;
    }

    setIsFinding(true);
    setFoundRestaurant(null);

    const buttonState = getButtonState();

    // If this is a free pick, increment immediately (optimistic server-side counter)
    if (buttonState === 'FREE_PICK') {
      await incrementPickCount();
    }

    let cuisinesToSearch =
      selectedCuisines[0].toLowerCase() === 'anything' ? cuisines.map((c) => c.name).filter((c) => c.toLowerCase() !== 'anything') : selectedCuisines;

    const { restaurant, error } = await findRestaurant({
      lat: location.lat,
      lng: location.lng,
      cuisines: cuisinesToSearch,
      radius: radius[0],
    });

    setIsFinding(false);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: error,
      });
      // If the find failed, we may want to roll back picksUsed — but keep it simple for now.
    } else if (restaurant) {
      setFoundRestaurant(restaurant);
    }
  };

  const getButtonState = (): ButtonState => {
    return 'UNLIMITED';
  };

  const buttonState = getButtonState();

  const renderButton = () => {
    switch (buttonState) {
      case 'LOADING':
        return (
          <Button disabled className="w-full h-14 text-xl font-bold" size="lg">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading...
          </Button>
        );
      case 'SIGN_UP':
        return (
          <Button onClick={() => router.push('/signup')} className="w-full h-14 text-xl font-bold" size="lg">
            Sign up to start picking
          </Button>
        );
      case 'FREE_PICK':
        return (
          <Button onClick={handleFindRestaurant} className="w-full h-14 text-xl font-bold" size="lg">
            Pick a restaurant
          </Button>
        );
      case 'UPGRADE':
        return (
          <Button onClick={() => router.push('/upgrade')} className="w-full h-14 text-xl font-bold" size="lg">
            Upgrade now for unlimited picks
          </Button>
        );
      case 'UNLIMITED':
        return (
          <Button onClick={handleFindRestaurant} className="w-full h-14 text-xl font-bold" size="lg">
            Pick a restaurant
          </Button>
        );
      default:
        return null;
    }
  };

  const remainingPicks = user ? Math.max(0, 3 - ((user as any).picksUsed ?? 0)) : 0;

  if (!hasMounted) {
    return (
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-4xl">Dinner Picker</CardTitle>
          </div>
          <CardDescription className="pt-2 text-base">
            Can't decide where to eat? Let fate pick for you!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-2 flex-grow" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Skeleton className="h-14 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in duration-500">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-3">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <CardTitle className="font-headline text-4xl">Dinner Picker</CardTitle>
        </div>
        <CardDescription className="pt-2 text-base">
          Can't decide where to eat? Let fate pick for you!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Select Cuisines</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cuisines.map((cuisine) => (
              <Toggle
                key={cuisine.id}
                variant="outline"
                aria-label={`Toggle ${cuisine.name}`}
                pressed={selectedCuisines.includes(cuisine.name)}
                onPressedChange={() => handleCuisineToggle(cuisine.name)}
                className="flex justify-start gap-2 text-base"
                disabled={isFinding}
              >
                {cuisine.icon}
                <span>{cuisine.name}</span>
              </Toggle>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Label htmlFor="radius-slider" className="text-lg font-semibold">
            Distance (miles)
          </Label>
          <div className="flex items-center gap-4">
            <Slider id="radius-slider" min={1} max={30} step={1} value={radius} onValueChange={setRadius} disabled={isFinding} />
            <div className="w-12 text-center text-lg font-semibold text-primary">{radius[0]}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {isFinding ? (
          <Button disabled className="w-full h-14 text-xl font-bold" size="lg">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Finding...
          </Button>
        ) : (
          renderButton()
        )}
        {buttonState === 'FREE_PICK' && (
          <p className="text-sm text-muted-foreground">
            You have {remainingPicks} {remainingPicks === 1 ? 'pick' : 'picks'} remaining.
          </p>
        )}
        {locationError && !location && (
          <Button variant="link" onClick={requestLocation}>
            <MapPin className="mr-2 h-4 w-4" /> Enable Location
          </Button>
        )}
      </CardFooter>

      {foundRestaurant && (
        <div ref={resultRef}>
          <Separator className="my-6" />
          <RestaurantCard restaurant={foundRestaurant} />
        </div>
      )}
    </Card>
  );
}
