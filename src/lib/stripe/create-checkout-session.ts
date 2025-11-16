import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

/**
 * Creates a Stripe checkout session for a user.
 * @param {string} uid - The user's Firebase UID.
 * @param {string} priceId - The ID of the Stripe price.
 * @returns {Promise<string>} The URL of the created checkout session.
 */
export async function createCheckoutSession(uid: string, priceId: string): Promise<string> {
  if (!uid || !priceId) {
    throw new Error('User ID and Price ID are required to create a checkout session.');
  }
  
  if (!adminDb) {
    throw new Error('Firebase Admin DB is not initialized.');
  }

  const userRef = adminDb.collection('users').doc(uid);
  const customerRef = adminDb.collection('customers').doc(uid);
  const customerSnap = await customerRef.get();

  let stripeId = customerSnap.data()?.stripeId;

  // If the user is not yet a customer in Stripe, create one.
  if (!stripeId) {
    const userSnap = await userRef.get();
    const userEmail = userSnap.data()?.email;

    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { firebaseUID: uid },
    });
    
    stripeId = customer.id;
    
    // Create a portal link for the customer to manage their subscription.
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });
    const stripeLink = portalSession.url;

    await customerRef.set({
        stripeId: stripeId,
        userId: uid,
        stripeLink: stripeLink,
    }, { merge: true });
  }

  const price = await stripe.prices.retrieve(priceId);
  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: price.type === 'one_time' ? 'payment' : 'subscription',
    customer: stripeId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      firebaseUID: uid,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create a Stripe checkout session.');
  }

  return session.url;
}
