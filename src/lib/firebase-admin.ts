import * as admin from 'firebase-admin';

// Ensure the service account key is available as a stringified JSON object
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  try {
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  } catch (e: any) {
    console.error('Firebase admin initialization error', e.stack);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
