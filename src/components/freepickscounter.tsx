// src/components/freepicksCounter.tsx
"use client";

import { useState } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function FreePicksCounter() {
  const { profile, loading } = useUserProfile();
  const [error, setError] = useState("");

  if (loading) return null;
  if (!profile) return null;

  const isPremium = profile.isPremium;
  const picksUsed = profile.picksUsed ?? 0;
  const remaining = 3 - picksUsed;

  async function handleUsePick() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        picksUsed: increment(1),
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  }

  if (isPremium) {
    return <p className="text-green-600">Premium user — unlimited picks!</p>;
  }

  return (
    <div>
      <p>You have {remaining} free picks remaining.</p>
      {remaining > 0 ? (
        <button onClick={handleUsePick}>Use a Pick</button>
      ) : (
        <p className="text-red-600">You've used all your free picks.</p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
