// src/components/FreePicksCounter.tsx
'use client';

import React from 'react';
import { useFreePicks } from '@/hooks/useFreePicks';

export default function FreePicksCounter({
  freeLimit = 3,
  onRequestUpgrade,
}: {
  freeLimit?: number;
  onRequestUpgrade?: () => void;
}) {
  const { remaining, picksUsed, isPremium, outOfPicks, loading, error, userLoading, usePick } = useFreePicks({ freeLimit });

  if (userLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading picks</div>;

  return (
    <div className="free-picks">
      {isPremium ? (
        <div className="text-sm">Premium account — unlimited picks</div>
      ) : (
        <div className="text-sm">
          Free picks remaining: <strong>{remaining}</strong> / {freeLimit}
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <button
          onClick={async () => {
            const res = await usePick();
            if (!res.ok && res.reason === 'out-of-picks' && onRequestUpgrade) {
              onRequestUpgrade();
            } else if (!res.ok) {
              // show error
              alert('Could not use pick: ' + (res.reason || 'unknown'));
            }
          }}
          disabled={loading || (!isPremium && outOfPicks)}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? 'Using…' : isPremium ? 'Use pick (premium)' : 'Use free pick'}
        </button>
      </div>
    </div>
  );
}
