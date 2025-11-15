'use client';
export const dynamic = 'force-dynamic';

import { useUser } from '@/firebase';
import { createCheckoutSession } from '@/app/actions';
import { useState } from 'react';

export default function UpgradePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await createCheckoutSession(user.uid);
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (e) {
      console.error('Upgrade error:', e);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Upgrade to Premium</h1>
      <p className="mb-4">Get unlimited restaurant picks.</p>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Processing...' : 'Upgrade Now'}
      </button>
    </div>
  );
}
