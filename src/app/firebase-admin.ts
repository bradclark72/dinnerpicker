// src/app/firebase-admin.ts
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";

export function initFirebaseAdmin() {
  // Prevent reinitialization errors during server actions
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT; // Google App Hosting injects this automatically

  // On Google App Hosting → use Google's built-in credentials (no private key needed)
  if (process.env.GOOGLE_CLOUD_PROJECT && !process.env.FIREBASE_PRIVATE_KEY) {
    return initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  }

  // Local development fallback
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

