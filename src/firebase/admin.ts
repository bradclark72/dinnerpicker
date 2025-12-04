import admin from "firebase-admin";
import serviceAccount from "../../serviceAccount.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      privateKey: serviceAccount.private_key,
      clientEmail: serviceAccount.client_email,
    }),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
