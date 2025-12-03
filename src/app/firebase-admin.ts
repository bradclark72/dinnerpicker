
// src/app/firebase-admin.ts
import * as admin from 'firebase-admin';

export function initFirebaseAdmin() {
  // Check if the app is already initialized to prevent errors
  if (!admin.apps.length) {
    // Make sure the environment variable is set.
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
        throw new Error('Could not initialize Firebase Admin SDK. Service account key may be malformed.');
    }
  }
  return admin.app();
}
