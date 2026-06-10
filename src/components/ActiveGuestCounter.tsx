'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActiveGuestCount } from '@/lib/actions/monitoring';

export default function ActiveGuestCounter() {
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
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white">
      <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Hóspedes Ativos Agora</p>
      <div className="flex items-center gap-3 mt-1">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-2xl font-black">{count}</span>
      </div>
    </div>
  );
}
