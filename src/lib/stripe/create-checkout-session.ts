'use server';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Creates a Stripe Checkout Session for a given user and price.
 *
 * @param uid The Firebase UID of the user.
 * @param priceId The ID of the Stripe Price object.
 * @returns The session URL for the client to redirect to.
 * @throws Will throw an error if the session creation fails.
 */
export async function createCheckoutSession(uid: string, priceId: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not set in the environment variables.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // The metadata will be available in the webhook event
      metadata: {
        uid,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    });

    if (!session.url) {
      throw new Error('Could not create Stripe Checkout Session.');
    }

    return session.url;
  } catch (error: any) {
    console.error('Stripe error:', error.message);
    throw new Error('Failed to create Stripe checkout session.');
  }
}
