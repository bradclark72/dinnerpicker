'use client';

import { useEffect, useState } from 'react';

export default function SeasonalBackground() {
  const [season, setSeason] = useState('');

  useEffect(() => {
    const month = new Date().getMonth();
    
    if (month >= 2 && month <= 4) {
      setSeason('spring');
    } else if (month >= 5 && month <= 7) {
      setSeason('summer');
    } else if (month >= 8 && month <= 10) {
      setSeason('autumn');
    } else {
      setSeason('winter');
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