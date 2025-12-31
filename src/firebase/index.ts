// src/firebase/index.ts
'use client';

// Core SDKs
export { firebaseApp, auth, db } from './firebase';

// Providers
export { FirebaseProvider } from './provider';
export { FirebaseClientProvider } from './client-provider';

// Hooks
export * from './hooks';

// Other utilities
export * from './errors';
export * from './error-emitter';
