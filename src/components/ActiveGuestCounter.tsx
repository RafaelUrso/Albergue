'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { getActiveGuestCount } from '@/lib/actions/guest-count';

export default function ActiveGuestCounter() {
  const t = useTranslations('HomePage');
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = async () => {
    try {
      const activeCount = await getActiveGuestCount();
      setCount(activeCount);
    } catch (error) {
      console.error('Error fetching guest count:', error);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 5000); // 5s latency requirement (RF-027 / RN-039)
    return () => clearInterval(interval);
  }, []);

  if (count === null) return <div className="h-6 w-32 animate-pulse bg-gray-200 rounded"></div>;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </div>
      <span className="text-sm font-medium text-gray-600">
        {t('activeGuests', { count })}
      </span>
    </div>
  );
}
