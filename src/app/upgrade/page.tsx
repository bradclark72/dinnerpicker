import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Upgrade Your Plan</h1>
        <p className="text-muted-foreground mt-2 text-lg">Choose the plan that's right for you and get unlimited picks!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Monthly Subscription</CardTitle>
            <CardDescription>Get unlimited restaurant picks and support the app.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="text-4xl font-bold">
              $1.99<span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Unlimited restaurant picks
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Access to future premium features
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Cancel anytime
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full text-lg" size="lg">Choose Monthly</Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col border-2 border-primary shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lifetime Membership</CardTitle>
              <div className="text-sm font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">BEST VALUE</div>
            </div>
            <CardDescription>One payment, unlimited picks forever.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="text-4xl font-bold">
              $19.99<span className="text-lg font-normal text-muted-foreground"> one-time</span>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Unlimited restaurant picks
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                All future premium features
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Never worry about payments again
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full text-lg" size="lg">Choose Lifetime</Button>
          </CardFooter>
        </Card>
      </div>
      <Button variant="link" asChild className="mt-8">
        <Link href="/">Back to Picker</Link>
      </Button>
    </main>
  );
}
