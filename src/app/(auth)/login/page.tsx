'use client';

import { UtensilsCrossed } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { signIn } from '@/firebase/auth';
import AuthForm from '@/components/auth-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (values: { email: string; password:string }) => {
    await signIn(values.email, values.password);
    // Force a full page reload to ensure all state is cleared and re-fetched
    window.location.href = '/';
  };

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
