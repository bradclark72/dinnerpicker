"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth, db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

// small confetti function
function fireConfetti() {
  if (typeof document === 'undefined') return;
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    if (Date.now() > end) return;

    const colors = ["#84cc16", "#f97316", "#fde047"]; // Using theme-friendly colors
    for (let i = 0; i < 2; i++) {
        const p = document.createElement("div");
        p.style.position = "fixed";
        p.style.top = Math.random() * 100 + "%";
        p.style.left = Math.random() * 100 + "%";
        p.style.width = Math.random() * 8 + 4 + "px";
        p.style.height = p.style.width;
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = "50%";
        p.style.opacity = "0.9";
        p.style.pointerEvents = "none";
        p.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    }

    requestAnimationFrame(frame);
  })();
}

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            isPremium: true,
          });
        } catch (err) {
          console.error("Failed to update user to premium:", err);
        }
      }
      
      fireConfetti();
      setTimeout(() => router.push("/"), 3000);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold pt-4">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
                Your account is now upgraded to Premium.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You now have unlimited restaurant picks.</p>
          <p className="text-muted-foreground mt-4 italic">Redirecting you home...</p>
        </CardContent>
      </Card>
    </div>
  );
}
