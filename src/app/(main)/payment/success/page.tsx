import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// Inside your useEffect, replace updateDoc with:
await setDoc(userRef, {
  membership: 'lifetime',
  subscriptionStatus: 'active',
  stripeCustomerId: session.customer,
  updatedAt: new Date()
}, { merge: true }); // merge: true will update existing or create new