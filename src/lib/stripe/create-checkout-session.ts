'use server';

import { stripe } from '.';
import { headers } from 'next/headers';
import { adminDb } from '../firebase-admin';

export async function createCheckoutSession(
  uid: string,
  priceId: string
): Promise<string> {
  if (!uid) {
    throw new Error('User not authenticated');
  }

  const origin = headers().get('origin');
  if (!origin) {
    throw new Error('Could not determine request origin');
  }

  // Check if user already has a Stripe customer ID
  const customerRef = adminDb.collection('customers').doc(uid);
  const customerSnap = await customerRef.get();
  let customerId = customerSnap.data()?.stripeId;

  // If not, create a new Stripe customer
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { firebaseUID: uid },
    });
    customerId = customer.id;
    await customerRef.set({ stripeId: customerId, userId: uid });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: priceId === process.env.STRIPE_LIFETIME_PRICE_ID ? 'payment' : 'subscription',
    customer: customerId,
    success_url: `${origin}/`,
    cancel_url: `${origin}/upgrade`,
  });

  if (!session.url) {
    throw new Error('Could not create checkout session');
  }

  return session.url;
}
