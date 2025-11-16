// src/lib/firebase-admin.ts
import * as admin from "firebase-admin";

let app: admin.app.App | null = null;

try {
  if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountJson) {
      // Do not throw here — allow server code to handle absent admin in environments where you don't need it.
      console.warn(
        "FIREBASE_SERVICE_ACCOUNT_KEY not found in env. Firebase Admin will not be initialized. This is expected in some local flows."
      );
    } else {
      const serviceAccount = JSON.parse(serviceAccountJson);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } else {
    app = admin.app();
  }
} catch (err) {
  console.error("Firebase Admin init failed:", err);
}

/**
 * Expose admin SDK helpers. They will throw or be no-ops if admin was not initialized.
 * Consumers should handle absence accordingly.
 */
export const adminApp = app;
export const adminAuth = adminApp ? admin.auth() : undefined;
export const adminDb = adminApp ? admin.firestore() : undefined;
export default adminApp;