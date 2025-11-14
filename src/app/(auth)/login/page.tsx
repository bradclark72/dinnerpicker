'use client';

import { UtensilsCrossed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { signIn } from '@/firebase/auth';
import AuthForm from '@/components/auth-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const handleLogin = async (values: { email: string; password:string }) => {
    await signIn(values.email, values.password);
    
    setIsRedirecting(true);

    toast({
        title: "Login Successful",
        description: "Redirecting to the app...",
    });

    // Wait for a short period to allow user state to propagate
    setTimeout(() => {
        window.location.href = '/';
    }, 1500);
  };

  if (isRedirecting) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Login successful, redirecting...</p>
        </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-3">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-4xl">Dinner Picker</CardTitle>
        </div>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm type="login" onSubmit={handleLogin} />
      </CardContent>
    </Card>
  );
}
