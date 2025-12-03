// src/app/firebase-admin.ts
import * as admin from 'firebase-admin';

export function initFirebaseAdmin() {
  // Check if the app is already initialized to prevent errors
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin.app();
}
