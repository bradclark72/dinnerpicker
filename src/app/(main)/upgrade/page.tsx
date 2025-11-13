'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase/auth/use-user';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/app/actions/stripe';
import { useToast } from '@/hooks/use-toast';

const monthlyFeatures = [
  "Unlimited restaurant spins",
  "All future premium features",
  "Cancel anytime",
];

const lifetimeFeatures = [
  "Unlimited restaurant spins",
  "All future premium features",
  "Save money and enjoy",
];

function UpgradePageContent() {
  const { data: user, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  const handleChoosePlan = async (priceId: string) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not logged in',
            description: 'You must be logged in to upgrade your plan.',
        });
      return;
    }

    try {
      const url = await createCheckoutSession(user.id, priceId, window.location.origin);
      if(url) {
        window.location.href = url;
      }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'Could not create checkout session.',
        });
    }
  };

  if(userLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Upgrade Your Plan</h1>
        <p className="text-muted-foreground mt-2">Choose the plan that's right for you and unlock premium features.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Monthly</CardTitle>
            <CardDescription>Perfect for trying out premium features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">$1.99<span className="text-base font-normal text-muted-foreground">/month</span></div>
            <ul className="space-y-2">
              {monthlyFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleChoosePlan(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!)} className="w-full">
                Choose Monthly
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Lifetime</CardTitle>
            <CardDescription>Pay once, enjoy premium features forever.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">$19.99<span className="text-base font-normal text-muted-foreground">/lifetime</span></div>
            <ul className="space-y-2">
              {lifetimeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleChoosePlan(process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID!)} className="w-full">
                Choose Lifetime
            </Button>
          </CardFooter>
        </Card>
      </div>
        <div className="mt-8 text-center">
            <Button variant="ghost" asChild>
                <Link href="/">
                    &larr; Back to the app
                </Link>
            </Button>
        </div>
    </div>
  );
}


export default function UpgradePage() {
    return (
        <FirebaseClientProvider>
            <UpgradePageContent />
        </FirebaseClientProvider>
    )
}
