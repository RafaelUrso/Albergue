'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { getTodayISO, parseDateUTC, formatDateToISO } from '@/lib/date-utils';

interface DateRangeSelectorProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  onSelect?: (checkIn: string, checkOut: string) => void;
}

export default function DateRangeSelector({ initialCheckIn, initialCheckOut, onSelect }: DateRangeSelectorProps) {
  const t = useTranslations('TopBar.search');

  const today = useMemo(() => getTodayISO(), []);

  const [checkIn, setCheckIn] = useState(initialCheckIn || today);
  const [checkOut, setCheckOut] = useState(initialCheckOut || '');

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCheckIn(val);
    let newCheckOut = checkOut;
    if (checkOut && val >= checkOut) {
      const checkInDate = parseDateUTC(val);
      const nextDay = new Date(checkInDate.getTime() + 86400000);
      newCheckOut = formatDateToISO(nextDay);
      setCheckOut(newCheckOut);
    }
    if (onSelect) onSelect(val, newCheckOut);
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCheckOut(val);
    if (onSelect) onSelect(checkIn, val);
  };

  const minCheckOut = useMemo(() => {
    if (!checkIn) return today;
    const checkInDate = parseDateUTC(checkIn);
    const nextDay = new Date(checkInDate.getTime() + 86400000);
    return formatDateToISO(nextDay);
  }, [checkIn, today]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 bg-gray-50 border border-gray-200 p-1 rounded-lg shadow-sm">
      <div className="flex flex-col">
        <label className="text-[10px] uppercase font-bold text-gray-500 px-2">{t('checkin')}</label>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={handleCheckInChange}
          className="bg-transparent text-gray-900 text-sm font-semibold outline-none px-2 py-1 appearance-none cursor-pointer"
        />
      </div>
      <div className="hidden md:block w-px h-8 bg-gray-200" />
      <div className="flex flex-col">
        <label className="text-[10px] uppercase font-bold text-gray-500 px-2">{t('checkout')}</label>
        <input
          type="date"
          min={minCheckOut}
          value={checkOut}
          onChange={handleCheckOutChange}
          className="bg-transparent text-gray-900 text-sm font-semibold outline-none px-2 py-1 appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
