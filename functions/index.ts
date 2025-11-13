import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Triggered when a subscription is created/updated in customers collection
export const updateUserMembership = functions.firestore
  .document('customers/{userId}/subscriptions/{subscriptionId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const subscription = change.after.data();

    if (!subscription) {
      // Subscription was deleted
      return null;
    }

    // Update user's membership based on subscription status
    let membership = 'free';
    
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      // Check the role or product to determine membership type
      membership = subscription.role || subscription.metadata?.membership || 'premium';
    }

    // Update users collection
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        membership: membership,
        subscriptionStatus: subscription.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    console.log(`Updated user ${userId} membership to ${membership}`);
    return null;
  });

// Also handle one-time payments
export const updateUserMembershipOnPayment = functions.firestore
  .document('customers/{userId}/payments/{paymentId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const payment = snap.data();

    if (payment.status === 'succeeded') {
      // For lifetime/one-time payments
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          membership: 'lifetime',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(`Updated user ${userId} to lifetime membership`);
    }

    return null;
  });