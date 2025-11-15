'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { createCheckoutSession, findRestaurant } from '@/actions/server-actions';import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function UpgradePage() {
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateCheckout = async (priceId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const sessionUrl = await createCheckoutSession(user.uid, priceId);
      window.location.href = sessionUrl;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: error.message || 'Could not create a checkout session.',
      });
      setLoading(false);
    }
  };

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!;
  const lifetimePriceId = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID!;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Upgrade to Premium</CardTitle>
          <CardDescription>Get unlimited restaurant picks and more!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
              <h3 className="text-xl font-semibold">Monthly Plan</h3>
              <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Unlimited Picks</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Priority Support</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handleCreateCheckout(monthlyPriceId)}
                disabled={loading || userLoading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Go Monthly - $5/mo
              </Button>
          </div>
          <div className="space-y-4">
              <h3 className="text-xl font-semibold">Lifetime Plan</h3>
              <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Unlimited Picks Forever</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> One-time payment</li>
              </ul>
              <Button 
                className="w-full"
                onClick={() => handleCreateCheckout(lifetimePriceId)}
                disabled={loading || userLoading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Go Lifetime - $49
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
