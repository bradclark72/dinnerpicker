// src/hooks/useUserProfile.ts
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useUserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const ref = doc(db, "users", user.uid);
        const unsubSnapshot = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            setProfile(null);
          }
          setLoading(false);
        });

        return () => unsubSnapshot();
    });

    return () => unsubscribe();
  }, []);

  return { profile, loading };
}
