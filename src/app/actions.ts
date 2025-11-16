// src/app/actions.ts
'use server';

import type { Restaurant } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createCheckoutSession as createStripeCheckoutSession } from '@/lib/stripe/create-checkout-session';


const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const MILES_TO_METERS = 1609.34;

/**
 * Find a random restaurant near a location using Google Places APIs
 */
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
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusInMeters}&type=restaurant&keyword=${encodeURIComponent(
      keyword
    )}&key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    const searchResult = await searchResponse.json();

    if (searchResult.status !== 'OK' && searchResult.status !== 'ZERO_RESULTS') {
      console.error('Google Places API Error:', searchResult.error_message);
      return { restaurant: null, error: searchResult.error_message || 'Failed to fetch restaurants.' };
    }

    if (!searchResult.results || searchResult.results.length === 0) {
      return { restaurant: null, error: 'No restaurants found matching your criteria. Try expanding your search!' };
    }

    const chosenPlace = searchResult.results[Math.floor(Math.random() * searchResult.results.length)];

    if (!chosenPlace || !chosenPlace.place_id) {
      return { restaurant: null, error: 'Could not decide on a restaurant. Please try again.' };
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${chosenPlace.place_id}&fields=name,formatted_address,formatted_phone_number,rating,website,user_ratings_total,geometry,price_level,photos&key=${API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsResult = await detailsResponse.json();

    if (detailsResult.status !== 'OK') {
      console.error('Google Place Details API Error:', detailsResult.error_message);
      return { restaurant: null, error: detailsResult.error_message || 'Failed to fetch restaurant details.' };
    }

    const firstCuisine = cuisines[0]?.toLowerCase() || 'anything';
    const placeholder =
      PlaceHolderImages.find((p) => p.id === firstCuisine) || PlaceHolderImages.find((p) => p.id === 'anything');

    let imageUrl = placeholder?.imageUrl;
    let imageHint = placeholder?.imageHint;

    if (detailsResult.result.photos && detailsResult.result.photos.length > 0) {
      const photoReference = detailsResult.result.photos[0].photo_reference;
      imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1080&photoreference=${photoReference}&key=${API_KEY}`;
      imageHint = 'restaurant photo';
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
      image_url: imageUrl,
      image_hint: imageHint,
    };

    return { restaurant: finalRestaurant, error: null };
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return { restaurant: null, error: `An unexpected error occurred. ${errorMessage}` };
  }
}

/**
 * createCheckoutSession - Server action used by upgrade flow to create a Stripe Checkout session.
 * Expects a `uid` string for linking the session to the user (metadata).
 */
export async function createCheckoutSession(uid: string, priceId: string) {
  try {
    const url = await createStripeCheckoutSession(uid, priceId);
    return { url, error: null };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return { url: null, error: error.message };
  }
}
