
// src/app/actions.ts
'use server';

import type { Restaurant } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdmin } from './firebase-admin';

// Note: .env is loaded by src/app/firebase-admin.ts for local development
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
 * Deletes a user's account and all associated data.
 * This is a destructive action and cannot be undone.
 * @param uid The user's ID.
 */
export async function deleteUserAccount(uid: string): Promise<{ success: boolean; error?: string }> {
  try {
    const app = initFirebaseAdmin();
    const auth = getAuth(app);
    const db = getFirestore(app);

    const userDocRef = db.collection('users').doc(uid);
    const customerDocRef = db.collection('customers').doc(uid);

    // Using a batch to ensure atomicity for Firestore deletions
    const batch = db.batch();
    batch.delete(userDocRef);
    batch.delete(customerDocRef);
    await batch.commit();
    
    // Delete user from Firebase Authentication
    await auth.deleteUser(uid);

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    // It's possible the Firestore docs don't exist, which is fine.
    // We only want to surface critical errors.
    if (error.code === 'auth/user-not-found') {
        return { success: true }; // Already deleted, consider it a success.
    }
    return { success: false, error: error.message || 'An unknown error occurred during account deletion.' };
  }
}
