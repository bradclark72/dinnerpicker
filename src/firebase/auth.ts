'use client';

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { addUserToFirestore } from './firestore';
import { getFirebaseApp } from './index';

// Initialize Firebase Auth and get a reference to the service
const app = getFirebaseApp();
const auth = getAuth(app);

export function onAuthUserChanged(
  callback: (user: FirebaseUser | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    // We throw a more user-friendly error message
    throw new Error('Invalid email or password. Please try again.');
  }
}

export async function signUp(email: string, password: string): Promise<void> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // After creating the user, add their profile to Firestore
    await addUserToFirestore(userCredential.user);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already in use.');
    }
    // For other errors, provide a generic message
    throw new Error('Could not create account. Please try again.');
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Could not sign out. Please try again.');
  }
}

// Export auth for other modules that might need it
export { auth };
