import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type { Stripe } from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured.');
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

  // Handle successful checkout session
  if (event.type === 'checkout.session.completed') {
    if (!session.metadata?.uid) {
        console.error('Webhook Error: Missing user ID (uid) in checkout session metadata.');
        return new Response('Webhook Error: Missing uid in metadata', { status: 400 });
    }

    const userId = session.metadata.uid;
    const userRef = adminDb.collection('users').doc(userId);

    try {
      // For a one-time payment (lifetime), set isPremium to true.
      await userRef.update({ isPremium: true });
      console.log(`Successfully updated user ${userId} to premium.`);
    } catch (error) {
      console.error(`Failed to update user ${userId} to premium:`, error);
      return new Response('Failed to update user premium status.', { status: 500 });
    }
  }

  // Handle subscription creation or updates for recurring payments
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const customersQuery = adminDb.collection('customers').where('stripeId', '==', customerId).limit(1);
    const customerSnapshot = await customersQuery.get();

    if (customerSnapshot.empty) {
        console.error(`Webhook Error: No customer found with Stripe ID: ${customerId}`);
        // We can't proceed without linking to a Firebase user.
        // Returning 200 to prevent Stripe from retrying a non-recoverable error.
        return new Response('Customer not found, but acknowledged.', { status: 200 });
    }

    const userId = customerSnapshot.docs[0].id;
    const userRef = adminDb.collection('users').doc(userId);

    const isPremium = subscription.status === 'active' || subscription.status === 'trialing';

    try {
        await userRef.update({ isPremium });
        console.log(`Subscription status updated for user ${userId}. Premium: ${isPremium}`);
    } catch (error) {
        console.error(`Failed to update subscription status for user ${userId}:`, error);
        return new Response('Failed to update user subscription status.', { status: 500 });
    }
  }


  return new Response(null, { status: 200 });
}
