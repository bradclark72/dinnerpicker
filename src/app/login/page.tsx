'use client';
import { AuthForm } from '@/components/auth/auth-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function LoginPage() {
  return (
    <FirebaseClientProvider>
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                  <CardTitle>Welcome Back</CardTitle>
              </div>
            <CardDescription>
              Sign in to your Dinner Picker account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode="login" />
          </CardContent>
        </Card>
      </main>
    </FirebaseClientProvider>
  );
}
