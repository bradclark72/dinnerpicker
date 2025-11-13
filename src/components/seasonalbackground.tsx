'use client';

import { useEffect, useState } from 'react';

export default function SeasonalBackground() {
  const [season, setSeason] = useState('');

  useEffect(() => {
    const month = new Date().getMonth(); // 0-11
    
    // Determine season based on month
    if (month >= 2 && month <= 4) {
      setSeason('spring'); // March, April, May
    } else if (month >= 5 && month <= 7) {
      setSeason('summer'); // June, July, August
    } else if (month >= 8 && month <= 10) {
      setSeason('autumn'); // September, October, November
    } else {
      setSeason('winter'); // December, January, February
    }
  }, []);

  return (
    <div 
      className={`fixed inset-0 -z-10 seasonal-bg ${season}`}
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    />
  );
}