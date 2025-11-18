// src/app/(main)/payment/success/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth, db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

// Lightweight confetti with no dependencies
function fireConfetti() {
  const duration = 900;
  const end = Date.now() + duration;

  (function frame() {
    const colors = ["#bb0000", "#ffffff", "#00bb00", "#0000bb"];
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.top = Math.random() * 100 + "%";
    p.style.left = Math.random() * 100 + "%";
    p.style.width = "8px";
    p.style.height = "8px";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.opacity = "0.9";
    p.style.borderRadius = "50%";
    p.style.pointerEvents = "none";
    document.body.appendChild(p);

    setTimeout(() => p.remove(), 1200);

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function updatePremium() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        await updateDoc(doc(db, "users", user.uid), {
          isPremium: true,
        });
      } catch (err) {
        console.error("Premium update failed:", err);
      }

      // Run our lightweight confetti
      fireConfetti();

      // Redirect home
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
