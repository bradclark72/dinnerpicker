'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, PartyPopper } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { updateUserMembership } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const [status, setStatus] = React.useState<'verifying' | 'success' | 'error'>('verifying');
    const [error, setError] = React.useState<string | null>(null);

    const effectRan = React.useRef(false);

    React.useEffect(() => {
        if (user && !loading && status === 'verifying' && !effectRan.current) {
            effectRan.current = true;
            const sessionId = searchParams.get('session_id');

            if (!sessionId) {
                setError('No session ID found. Your payment may not have been processed correctly.');
                setStatus('error');
                return;
            }

            const updateMembership = async () => {
                // In a real app, you would verify the session_id with your backend and Stripe
                // to confirm the payment was successful before updating the user's membership.
                // For this prototype, we will assume the payment was successful if we have a session_id.
                const { success, error: updateError } = await updateUserMembership(user.id, 'lifetime');

                if (success) {
                    setStatus('success');
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    setError(updateError || 'An error occurred while updating your membership.');
                    setStatus('error');
                }
            };

            updateMembership();
        }
    }, [user, loading, status, router, searchParams]);

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    {status === 'verifying' && <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />}
                    {status === 'success' && <PartyPopper className="mx-auto h-12 w-12 text-primary" />}
                    <CardTitle className="mt-4 text-2xl font-bold">
                        {status === 'verifying' && 'Verifying Your Payment...'}
                        {status === 'success' && 'Payment Successful!'}
                        {status === 'error' && 'Payment Error'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'verifying' && 'Please wait while we confirm your payment and upgrade your account.'}
                        {status === 'success' && "Congratulations! You're now a premium member. You will be redirected shortly."}
                        {status === 'error' && error}
                    </CardDescription>
                </CardHeader>
                {status === 'error' && (
                    <CardContent>
                        <Button onClick={() => router.push('/')}>
                            Return to Homepage
                        </Button>
                    </CardContent>
                )}
            </Card>
        </main>
    );
}
