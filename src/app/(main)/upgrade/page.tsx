'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const monthlyLink = "https://buy.stripe.com/test_fZu6oG3Ma1dR6D540F8AE04";
  const lifetimeLink = "https://buy.stripe.com/test_8x26oGaay8GjbXpdBf8AE05";

  const handleRedirect = (url: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    window.location.href = url;
  };

  const isLoading = userLoading;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">
            Unlock unlimited restaurant picks and support our service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Plan */}
          <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-center mb-4">Monthly Subscription</h2>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-indigo-600">$1.99</span>
              <span className="text-gray-600"> / month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-xl">✓</span>
                Unlimited restaurant picks
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-xl">✓</span>
                All future features included
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-xl">✓</span>
                Works anywhere you are
              </li>
            </ul>

            <Button
              onClick={() => handleRedirect(monthlyLink)}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Subscribe Now
            </Button>
          </div>

          {/* Lifetime Plan */}
          <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col border-2 border-primary">
            <div className="text-center text-sm font-bold bg-primary text-primary-foreground py-1 px-4 rounded-full -mt-12 mx-auto">
              Best Value
            </div>

            <h2 className="text-2xl font-bold text-center mb-4 mt-4">
              Lifetime Membership
            </h2>

            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-primary">$19.99</span>
              <span className="text-gray-600"> one-time</span>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-xl">✓</span>
                Unlimited restaurant picks, forever
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-xl">✓</span>
                Pay once, no recurring fees
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 text-xl">✓</span>
                All future features included
              </li>
            </ul>

            <Button
              onClick={() => handleRedirect(lifetimeLink)}
              disabled={isLoading}
              className="w-full py-4 rounded-lg font-bold text-lg"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Get Lifetime Access
            </Button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">Secure payments processed by Stripe.</p>

          <Button variant="link" asChild>
            <Link href="/">Maybe later</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
