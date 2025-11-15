'use client';
export const dynamic = 'force-dynamic';

import { useUser } from '@/firebase';
import { createCheckoutSession } from '@/app/actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function UpgradePage() {
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const lifetimePriceId = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID;
  if (!lifetimePriceId) {
    console.error("Stripe Lifetime Price ID is not set in environment variables.");
  }


  const handleUpgrade = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not signed in',
        description: 'You must be signed in to upgrade.',
      });
      router.push('/login');
      return;
    }
    
    if (!lifetimePriceId) {
      toast({
          variant: 'destructive',
          title: 'Configuration Error',
          description: 'The payment system is not configured correctly. Please contact support.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await createCheckoutSession(user.uid, lifetimePriceId);
      if (res.url) {
        window.location.href = res.url;
      } else if (res.error) {
        throw new Error(res.error);
      }
    } catch (e: any) {
      console.error('Upgrade error:', e);
      toast({
        variant: 'destructive',
        title: 'Upgrade Failed',
        description: e.message || 'Could not initiate the checkout process. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = userLoading || loading || !lifetimePriceId;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
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
              <span>Unlimited restaurant picks</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span>No waiting for resets</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span>All future features</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={isButtonDisabled}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : (userLoading ? 'Verifying account...' : 'Get Lifetime Access')}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}
