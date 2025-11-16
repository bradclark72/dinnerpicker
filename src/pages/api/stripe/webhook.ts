import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { adminDb } from '@/lib/firebase-admin';

// Disable the default body parser for this route to stream the request
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).send('Missing Stripe signature');
  }

  const buf = await buffer(req);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const firebaseUID = session.metadata?.firebaseUID;

      if (firebaseUID) {
        try {
          // Update the user's document in Firestore to grant premium access
          const userRef = adminDb.collection('users').doc(firebaseUID);
          await userRef.update({
            isPremium: true,
          });
          console.log(`✅ Granted premium access to user: ${firebaseUID}`);
        } catch (error) {
          console.error(`🔥 Failed to update user document for UID: ${firebaseUID}`, error);
          // You might want to add more robust error handling here, like retrying
        }
      }
      break;

    // You can add other event types here as needed
    // case 'customer.subscription.deleted':
    //   // handle subscription cancellations
    //   break;

    default:
      console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
}

export default handler;
