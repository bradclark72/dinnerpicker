import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { updateUserMembershipFromStripe } from '@/firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.client_reference_id;
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0].price?.id;

        if (!userId) {
          throw new Error('User ID not found in checkout session metadata.');
        }

        let membership: 'monthly' | 'lifetime' | null = null;
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID) {
          membership = 'monthly';
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID) {
          membership = 'lifetime';
        }
        
        if (!membership) {
            throw new Error(`Could not determine membership level for price ID: ${priceId}`);
        }

        await updateUserMembershipFromStripe(userId, membership);
        console.log(`Successfully updated membership for user ${userId} to ${membership}.`);
        break;

      default:
        // Optionally handle other event types
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook handler error: ${errorMessage}`);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
