'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { updateUserMembership } from '@/firebase/firestore';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait until the auth state is fully loaded and we have a user and session ID.
    if (loading || !sessionId || !user) {
      return;
    }

    const upgradeMembership = async () => {
      // In a real app, you would verify the session ID with your backend/Stripe.
      // For this prototype, we assume the session is valid and upgrade the user.
      // A check to see which product was purchased would determine monthly vs lifetime.
      await updateUserMembership(user.id, 'lifetime');

      // Redirect to the home page after a short delay to show the success message.
      setTimeout(() => {
        router.push('/');
      }, 3000);
    };

    upgradeMembership();
  }, [sessionId, user, router, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-card text-card-foreground shadow-lg rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Thank you for your subscription. Your account has been upgraded. You will be redirected shortly.
        </p>
        
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
