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
};
