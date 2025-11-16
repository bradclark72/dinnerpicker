import * as admin from 'firebase-admin';

// Ensure the service account JSON is available as an environment variable.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

// Initialize the Admin SDK, but only if it hasn't been initialized yet.
// This is crucial for serverless environments where functions can be re-used.
if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback for local development if the service account key isn't set.
    // This assumes the `gcloud auth application-default login` has been run.
    console.warn("Firebase Admin SDK: Service account not found. Initializing with default credentials. This is intended for local development only.");
    admin.initializeApp();
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
