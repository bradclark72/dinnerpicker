// src/app/(main)/payment/success/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth, db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import confetti from "canvas-confetti";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function updatePremium() {
      const user = auth.currentUser;
      if (!user) return;

      // Firestore update
      try {
        await updateDoc(doc(db, "users", user.uid), {
          isPremium: true,
        });
      } catch (err) {
        console.error("Premium update failed:", err);
      }

      // 🎉 Confetti celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Redirect back to home
      setTimeout(() => router.push("/"), 2000);
    }

    updatePremium();
  }, []);

  return (
    <div className="p-14 text-center bg-yellow-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-green-700">Payment Successful!</h1>
      <p className="mt-4 text-gray-700 text-lg">
        Your account is now upgraded to Premium.
      </p>
      <p className="text-gray-500 mt-6 italic">Redirecting…</p>
    </div>
  );
}
