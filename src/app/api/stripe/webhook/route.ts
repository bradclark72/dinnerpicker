import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Stripe } from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response('Stripe webhook secret not configured.', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const customerId = session.customer as string;
    
    // Retrieve the user from Firestore using the Stripe customer ID
    const customersQuery = adminDb.collection('customers').where('stripeId', '==', customerId).limit(1);
    const customerSnapshot = await customersQuery.get();

    if (customerSnapshot.empty) {
      console.error(`Webhook Error: No customer found with Stripe ID: ${customerId}`);
      return new Response('Customer not found.', { status: 404 });
    }

    const userId = customerSnapshot.docs[0].id;
    const userRef = adminDb.collection('users').doc(userId);

    try {
      await userRef.update({ isPremium: true });
      console.log(`Successfully updated user ${userId} to premium.`);
    } catch (error) {
      console.error(`Failed to update user ${userId} to premium:`, error);
      return new Response('Failed to update user.', { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}
