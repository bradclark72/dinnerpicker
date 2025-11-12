import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  "Unlimited restaurant spins",
  "All future premium features",
];

const STRIPE_SUCCESS_URL = 'http://localhost:9002/payment/success?session_id={CHECKOUT_SESSION_ID}';
const STRIPE_CANCEL_URL = 'http://localhost:9002/';

export default function UpgradePage() {
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
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href={`https://buy.stripe.com/test_fZu6oG3Ma1dR6D540F8AE04?success_url=${encodeURIComponent(STRIPE_SUCCESS_URL)}&cancel_url=${encodeURIComponent(STRIPE_CANCEL_URL)}`} target="_blank" rel="noopener noreferrer">
                Choose Monthly
              </a>
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
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href={`https://buy.stripe.com/test_8x26oGaay8GjbXpdBf8AE05?success_url=${encodeURIComponent(STRIPE_SUCCESS_URL)}&cancel_url=${encodeURIComponent(STRIPE_CANCEL_URL)}`} target="_blank" rel="noopener noreferrer">
                Choose Lifetime
              </a>
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
