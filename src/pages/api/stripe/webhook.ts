import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;

            // This is the Firebase UID we passed in client_reference_id
            const uid = session.client_reference_id;

            if (!uid) {
                console.error('Webhook Error: No client_reference_id in checkout session');
                return res.status(400).send('Webhook Error: Missing user identifier.');
            }
            
            try {
                // Update the user's document in Firestore to mark them as premium
                const userRef = adminDb.collection('users').doc(uid);
                await userRef.update({
                    isPremium: true,
                });

                // Store customer ID if it doesn't exist
                if (session.customer && typeof session.customer === 'string') {
                    const customerRef = adminDb.collection('customers').doc(uid);
                    await customerRef.set({
                        stripeId: session.customer,
                        userId: uid,
                    }, { merge: true });
                }

                console.log(`Successfully marked user ${uid} as premium.`);

            } catch (dbError) {
                console.error('Firestore update failed:', dbError);
                return res.status(500).send('Internal Server Error: Could not update user status.');
            }

            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
};

export default handler;
