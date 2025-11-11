'use server';

import { rankRestaurants } from '@/ai/ai-restaurant-ranker';
import type { Restaurant } from '@/lib/types';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const MILES_TO_METERS = 1609.34;

export async function findRestaurant(data: {
  lat: number;
  lng: number;
  cuisines: string[];
  radius: number;
}): Promise<{ restaurant: Restaurant | null; error: string | null }> {
  const { lat, lng, cuisines, radius } = data;

  if (!API_KEY) {
    return { restaurant: null, error: 'Google Maps API key is missing.' };
  }

  if (!lat || !lng) {
    return { restaurant: null, error: 'Location not provided.' };
  }

  const radiusInMeters = radius * MILES_TO_METERS;
  const keyword = cuisines.join(' | ');

  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusInMeters}&type=restaurant&keyword=${encodeURIComponent(keyword)}&key=${API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchResult = await searchResponse.json();

    if (searchResult.status !== 'OK' && searchResult.status !== 'ZERO_RESULTS') {
      console.error('Google Places API Error:', searchResult.error_message);
      return { restaurant: null, error: searchResult.error_message || 'Failed to fetch restaurants.' };
    }

    if (!searchResult.results || searchResult.results.length === 0) {
      return { restaurant: null, error: 'No restaurants found matching your criteria. Try expanding your search!' };
    }
    
    // Pick a random restaurant from the list if only one, otherwise use AI
    let chosenPlace;
    if (searchResult.results.length === 1) {
        chosenPlace = searchResult.results[0];
    } else {
        const rankedRestaurants = await rankRestaurants({
          restaurants: searchResult.results.map((r: any) => ({
            name: r.name,
            address: r.vicinity,
            rating: r.rating,
            priceLevel: r.price_level,
            userRatingsTotal: r.user_ratings_total,
            cuisine: r.types.join(', '),
          })),
          userPreferences: {
            cuisine: cuisines.join(', '),
          },
        });

        if (!rankedRestaurants || rankedRestaurants.length === 0) {
          return { restaurant: null, error: 'Could not decide on a restaurant. Please try again.' };
        }
        
        // Find the original place object from the ranked result
        const topRanked = rankedRestaurants[0];
        chosenPlace = searchResult.results.find((p: any) => p.name === topRanked.name && p.vicinity === topRanked.address);
    }


    if (!chosenPlace || !chosenPlace.place_id) {
      // As a fallback, just pick a random one if AI fails to find the match
      chosenPlace = searchResult.results[Math.floor(Math.random() * searchResult.results.length)];
      if (!chosenPlace || !chosenPlace.place_id) {
        return { restaurant: null, error: 'Could not decide on a restaurant. Please try again.' };
      }
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${chosenPlace.place_id}&fields=name,formatted_address,formatted_phone_number,rating,website,user_ratings_total,geometry,price_level&key=${API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsResult = await detailsResponse.json();
    
    if (detailsResult.status !== 'OK') {
        console.error('Google Place Details API Error:', detailsResult.error_message);
        return { restaurant: null, error: detailsResult.error_message || 'Failed to fetch restaurant details.' };
    }

    const finalRestaurant: Restaurant = {
      name: detailsResult.result.name,
      address: detailsResult.result.formatted_address,
      phone: detailsResult.result.formatted_phone_number,
      rating: detailsResult.result.rating,
      user_ratings_total: detailsResult.result.user_ratings_total,
      website: detailsResult.result.website,
      price_level: detailsResult.result.price_level,
      location: {
        lat: detailsResult.result.geometry.location.lat,
        lng: detailsResult.result.geometry.location.lng,
      },
      place_id: chosenPlace.place_id,
    };
    
    return { restaurant: finalRestaurant, error: null };

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return { restaurant: null, error: `An unexpected error occurred. ${errorMessage}` };
  }
}
