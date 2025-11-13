'use server';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  mode: 'subscription' | 'payment',
  origin: string
): Promise<string | null> {
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  const successUrl = `${origin}/payment/success`;
  const cancelUrl = `${origin}/upgrade`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });

    return session.url;
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    throw new Error('Could not create Stripe checkout session.');
  }
}
