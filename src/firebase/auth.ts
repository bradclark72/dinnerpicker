'use client';

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { addUserToFirestore } from './firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAuJUXmvmAUtLIAxGxXfHrAkuYFJ4NVxKE",
  authDomain: "studio-2822881531-c4670.firebaseapp.com",
  projectId: "studio-2822881531-c4670",
  storageBucket: "studio-2822881531-c4670.firebasestorage.app",
  messagingSenderId: "768823222257",
  appId: "1:768823222257:web:6ef90257cea48b1c94ae50"
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export function onAuthUserChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signIn(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof Error) {
        throw new Error('Invalid email or password. Please try again.');
    }
    throw error;
  }
}

export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await addUserToFirestore(userCredential.user);
  } catch (error) {
    if (error instanceof Error) {
        if ('code' in error && (error as any).code === 'auth/email-already-in-use') {
            throw new Error('This email address is already in use.');
        }
        throw new Error('Could not create account. Please try again.');
    }
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Could not sign out. Please try again.');
  }
}

export { firebaseApp, auth, db };
