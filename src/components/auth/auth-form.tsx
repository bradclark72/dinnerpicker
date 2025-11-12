'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const auth = getAuth();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!firestore) throw new Error('Firestore not initialized');
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;
        
        const newUserProfile = {
          id: user.uid,
          email: user.email,
          registrationDate: new Date().toISOString(),
          spinsRemaining: 3,
          membership: 'free',
        };

        const userDocRef = doc(firestore, 'users', user.uid);

        setDoc(userDocRef, newUserProfile)
          .then(() => {
            toast({
              title: 'Account Created',
              description: 'You have been successfully signed up!',
            });
            router.push('/');
          })
          .catch((error) => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: newUserProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
          })
          .finally(() => {
             setIsLoading(false);
          });
        
        return; // Return early because of the async nature of the promise chain
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({
          title: 'Signed In',
          description: 'You have been successfully signed in!',
        });
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message,
      });
    } finally {
       if (mode !== 'signup') {
         setIsLoading(false);
       }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link href="/signup" className="underline text-primary">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="underline text-primary">
                Login
              </Link>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
