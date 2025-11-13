'use client';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/lib/types';
import { firebaseApp } from './config';
import { errorEmitter, FirestorePermissionError } from './errors';

const db = getFirestore(firebaseApp);

export async function addUserToFirestore(firebaseUser: FirebaseUser) {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const newUser: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    registrationDate: new Date().toISOString(),
    spinsRemaining: 3,
    membership: 'free',
  };

  setDoc(userDocRef, newUser).catch(error => {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'create',
      requestData: newUser,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function getUserProfile(userId: string) {
  const userDocRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    } else {
      return null;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
    return null;
  }
}

export async function decrementSpins(userId: string) {
  const userDocRef = doc(db, 'users', userId);
  const user = await getUserProfile(userId);

  if (user && user.membership === 'free' && user.spinsRemaining > 0) {
    const newSpins = user.spinsRemaining - 1;
    updateDoc(userDocRef, { spinsRemaining: newSpins }).catch(error => {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestData: { spinsRemaining: newSpins },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }
}

export async function updateUserMembership(userId: string, membership: 'monthly' | 'lifetime') {
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, { membership: membership });
        return { success: true };
    } catch (error) {
        if (error instanceof Error && error.message.includes('permission-denied')) {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestData: { membership: membership },
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

// This function is intended to be called from a trusted server environment (like a webhook)
export async function updateUserMembershipFromStripe(userId: string, membership: 'monthly' | 'lifetime') {
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, { membership: membership, spinsRemaining: -1 }); // -1 can mean unlimited
    return { success: true };
  } catch (error) {
    console.error(`Failed to update membership for user ${userId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}
