import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // When deployed, this will use the service account granted to the App Hosting environment.
    // In your local environment, you may need to set GOOGLE_APPLICATION_CREDENTIALS.
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
