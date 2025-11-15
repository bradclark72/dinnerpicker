'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { createCheckoutSession } from '@/lib/stripe/create-checkout-session';

export default function UpgradePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const firestore = useFirestore(); // Safely get Firestore instance

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!firestore) {
      console.error('Firestore not available');
      alert('Could not connect to the database. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID;
      if (!priceId) {
        throw new Error('Stripe lifetime price ID is not configured.');
      }
      
      const checkoutUrl = await createCheckoutSession(user.uid, priceId);
      window.location.assign(checkoutUrl);

    } catch (error) {
      console.error('Upgrade error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Failed to start checkout. ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Upgrade to Lifetime Access
        </h1>
        
        <div className="bg-indigo-50 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-indigo-600">$9.99</span>
            <span className="text-gray-600"> one-time</span>
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span>Unlimited restaurant picks forever</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span>No more waiting for resets</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span>Access all future features</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading || !user}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? 'Processing...' : 'Get Lifetime Access'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}
