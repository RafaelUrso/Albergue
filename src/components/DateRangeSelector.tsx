'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

interface DateRangeSelectorProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  onSelect?: (checkIn: string, checkOut: string) => void;
}

export default function DateRangeSelector({ initialCheckIn, initialCheckOut, onSelect }: DateRangeSelectorProps) {
  const t = useTranslations('TopBar.search');
  const [checkIn, setCheckIn] = useState(initialCheckIn || '');
  const [checkOut, setCheckOut] = useState(initialCheckOut || '');
  const [minCheckIn, setMinCheckIn] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMinCheckIn(today);
    if (!checkIn) setCheckIn(today);
  }, []);

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCheckIn(val);
    if (checkOut && val >= checkOut) {
      setCheckOut('');
    }
    if (onSelect) onSelect(val, checkOut);
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCheckOut(val);
    if (onSelect) onSelect(checkIn, val);
  };

  const minCheckOut = checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : minCheckIn;

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 bg-white/10 p-1 rounded-lg">
      <div className="flex flex-col">
        <label className="text-[10px] uppercase font-bold text-white/70 px-2">{t('checkin')}</label>
        <input
          type="date"
          min={minCheckIn}
          value={checkIn}
          onChange={handleCheckInChange}
          className="bg-transparent text-white text-sm outline-none px-2 py-1 appearance-none"
        />
      </div>
      <div className="hidden md:block w-px h-8 bg-white/20" />
      <div className="flex flex-col">
        <label className="text-[10px] uppercase font-bold text-white/70 px-2">{t('checkout')}</label>
        <input
          type="date"
          min={minCheckOut}
          value={checkOut}
          onChange={handleCheckOutChange}
          className="bg-transparent text-white text-sm outline-none px-2 py-1 appearance-none"
        />
      </div>
    </div>
  );
}
