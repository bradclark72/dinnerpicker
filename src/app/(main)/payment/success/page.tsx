'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const { refetch } = useUser();

  // Refetch user data to get the latest premium status
  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">
            Your account has been upgraded to premium.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Thank you for your purchase. You now have unlimited access to all features.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Start Picking Restaurants</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
