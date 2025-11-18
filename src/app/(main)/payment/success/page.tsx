"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth, db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

// small confetti function
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
    p.style.borderRadius = "50%";
    p.style.opacity = "0.9";
    p.style.pointerEvents = "none";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1200);

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    console.log("🔥 Success page mounted");

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("👤 Auth state:", user);

      if (!user) {
        console.warn("⚠ No user found — redirecting anyway");
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      try {
        console.log("⬆ Updating Firestore premium flag...");
        await updateDoc(doc(db, "users", user.uid), {
          isPremium: true,
        });
        console.log("✅ Premium updated!");
      } catch (err) {
        console.error("❌ updateDoc error:", err);
      }

      fireConfetti();

      console.log("➡ Redirecting home in 2 sec...");
      setTimeout(() => router.push("/"), 2000);
    });

    return () => unsubscribe();
  }, [router]);

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
