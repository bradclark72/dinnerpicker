'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        const data = userDoc.data();
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!userData?.spinsResetAt) return;

    const updateCountdown = () => {
      const resetTime = userData.spinsResetAt.toDate();
      const now = new Date();
      const diff = resetTime - now;

      if (diff <= 0) {
        setTimeRemaining('Ready to spin!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [userData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">Dinner Picker</h1>
        <p className="text-gray-600 mb-8">Sign in to pick your dinner!</p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  // Logged in - Free user
  if (userData?.membership === 'free') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
        <p className="text-gray-600 mb-8">Upgrade to get unlimited spins</p>
        
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Free Plan</h2>
          <p className="text-gray-600 mb-6">Limited features</p>
          
          <Link
            href="/upgrade"
            className="block w-full bg-indigo-600 text-white text-center px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  // Logged in - Premium/Lifetime user
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Dinner Picker</h1>
      
      {/* Spin Counter */}
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">
          🎰 Spins: {userData?.spinsRemaining || 0}/3
        </h2>
        
        {/* Visual spin indicators */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                i <= (userData?.spinsRemaining || 0)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Spin button or countdown */}
        {userData?.spinsRemaining > 0 ? (
          <button
            onClick={() => {/* Handle spin logic */}}
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-md hover:bg-indigo-700 text-lg font-bold"
          >
            Pick My Dinner!
          </button>
        ) : (
          <div>
            <p className="text-red-600 font-bold mb-2">No spins remaining</p>
            <p className="text-gray-600">Resets in: {timeRemaining}</p>
          </div>
        )}
      </div>

      {/* Membership badge */}
      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full">
        ✓ {userData?.membership === 'lifetime' ? 'Lifetime' : 'Premium'} Member
      </div>
    </div>
  );
}