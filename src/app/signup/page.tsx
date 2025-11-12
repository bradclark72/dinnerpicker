import { AuthForm } from '@/components/auth/auth-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <CardTitle>Create an Account</CardTitle>
        </div>
          <CardDescription>
            Join Dinner Picker to save your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" />
        </CardContent>
      </Card>
    </main>
  );
}
