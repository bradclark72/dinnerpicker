export type Restaurant = {
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  location: {
    lat: number;
    lng: number;
  };
  price_level?: number;
  place_id?: string;
  image_url?: string;
  image_hint?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  registrationDate: string;
  spinsRemaining: number;
  membership: 'free' | 'monthly' | 'lifetime';
};
