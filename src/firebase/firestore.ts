'use client';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/lib/types';
import { getFirebaseApp } from './index';
import { errorEmitter, FirestorePermissionError } from './errors';

const db = getFirestore(getFirebaseApp());

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
    
    // We only decrement if the user is not a lifetime member.
    const user = await getUserProfile(userId);
    if (user && user.membership === 'lifetime') {
        return; // Do not decrement for lifetime members.
    }

    // Use FieldValue.increment to atomically decrement the value.
    // This is safer than reading the value, decrementing it, and writing it back.
    updateDoc(userDocRef, { 
        spinsRemaining: increment(-1) 
    }).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestData: { spinsRemaining: 'decrement' },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

    