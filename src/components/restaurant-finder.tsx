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
import type { Restaurant, User } from '@/lib/types';
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
import { useRouter } from 'next/navigation';
import { decrementSpins, getUserProfile } from '@/firebase/firestore';

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

type RestaurantFinderProps = {
  user: User | null;
  loading: boolean;
};

export default function RestaurantFinder({ user, loading }: RestaurantFinderProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [location, setLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = React.useState<string[]>(['Anything']);
  const [radius, setRadius] = React.useState([5]);
  const [isFinding, setIsFinding] = React.useState(false);
  const [foundRestaurant, setFoundRestaurant] = React.useState<Restaurant | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = React.useState(user);

  React.useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const userProfile = await getUserProfile(user.id);
        setCurrentUser(userProfile);
      }
      fetchUserProfile();
    } else {
      setCurrentUser(null);
    }
  }, [user]);

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
    // Check for permissions on mount without fetching location immediately
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          // Silently get location if permission is already granted
          requestLocation();
        } else if (permissionStatus.state === 'prompt') {
          // The user will be prompted when they click the button.
          setLocationError('Location access is required. Click the button to grant it.');
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
        newCuisines = [...prev.filter(c => c !== 'Anything'), cuisineName];
      }
      if(newCuisines.length === 0) {
        return ['Anything'];
      }
      return newCuisines;
    });
  };

  const handleFindRestaurant = async () => {
    if (currentUser && currentUser.membership === 'free' && currentUser.spinsRemaining === 0) {
      router.push('/upgrade');
      return;
    }

    if (!location) {
      requestLocation(); // Request location on click if not already available
      if (!location) { // Check again after request
        toast({
          variant: 'destructive',
          title: 'Location not ready',
          description: locationError || 'Please wait for location detection or grant permission.',
        });
        return;
      }
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
    
    let cuisinesToSearch = selectedCuisines[0].toLowerCase() === 'anything' ? cuisines.map(c => c.name).filter(c => c.toLowerCase() !== 'anything') : selectedCuisines;

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
    } else if (restaurant) {
      if (currentUser && currentUser.membership === 'free') {
        await decrementSpins(currentUser.id);
        const updatedUser = await getUserProfile(currentUser.id);
        setCurrentUser(updatedUser);
      }
      setFoundRestaurant(restaurant);
    }
  };
  
  const isLoading = isFinding || loading;

  const renderButton = () => {
    if (isLoading && !isFinding) {
      return (
        <Button disabled className="w-full h-14 text-xl font-bold" size="lg">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading...
        </Button>
      );
    }

    if (isFinding) {
      return (
        <Button disabled className="w-full h-14 text-xl font-bold" size="lg">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Finding...
        </Button>
      );
    }
    
    if (!currentUser && !loading) {
      return (
        <Button
          onClick={() => router.push('/login')}
          className="w-full h-14 text-xl font-bold"
          size="lg"
        >
          Login Now and Start Picking
        </Button>
      );
    }

    if (currentUser && currentUser.membership === 'free') {
        if(currentUser.spinsRemaining > 0) {
            return (
                <Button
                    onClick={handleFindRestaurant}
                    disabled={isLoading}
                    className="w-full h-14 text-xl font-bold"
                    size="lg"
                >
                    Find a Restaurant ({currentUser.spinsRemaining} spins remaining)
                </Button>
            );
        } else {
            return (
                <Button
                    onClick={() => router.push('/upgrade')}
                    className="w-full h-14 text-xl font-bold"
                    size="lg"
                >
                    Upgrade for More Spins
                </Button>
            );
        }
    }


    return (
      <Button
        onClick={handleFindRestaurant}
        disabled={isLoading}
        className="w-full h-14 text-xl font-bold"
        size="lg"
      >
        Find a Restaurant
      </Button>
    );
  };

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
                disabled={isLoading}
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
            <Slider
              id="radius-slider"
              min={1}
              max={30}
              step={1}
              value={radius}
              onValueChange={setRadius}
              disabled={isLoading}
            />
            <div className="w-12 text-center text-lg font-semibold text-primary">
              {radius[0]}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {renderButton()}
        {locationError && !location && (
          <p className="text-sm text-destructive text-center flex items-center gap-2"><MapPin className="h-4 w-4" />{locationError}</p>
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
