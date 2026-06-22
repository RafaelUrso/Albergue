'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getActiveGuestCount } from '@/lib/actions/monitoring';

export default function ActiveGuestCounter() {
  const t = useTranslations('Reception');
  const [count, setCount] = useState<number>(0);

  const fetchCount = useCallback(async () => {
    try {
      const c = await getActiveGuestCount();
      setCount(c);
    } catch (e) {
      console.error('Failed to fetch guest count', e);
    }
  }, []);

  useEffect(() => {
    // Para evitar o erro de cascading renders do lint,
    // chamamos a função assíncrona que atualiza o estado.
    const init = async () => {
      await fetchCount();
    };
    init();

    const interval = setInterval(fetchCount, 5000); // 5s latency requirement (RF-027 / RN-039)
    return () => clearInterval(interval);
  }, [fetchCount]);

  return (
    <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 shadow-xl transition-all hover:scale-105">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-azul-principal font-black text-2xl leading-none">{count}</span>
        <span className="text-azul-principal font-bold text-[11px] uppercase tracking-wide whitespace-nowrap">
          {t('activeGuests')}
        </span>
      </div>
    </div>
  );
}
