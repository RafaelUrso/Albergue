'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface GuestSelectorProps {
  initialAdults?: number;
  initialChildren?: number;
  initialPcd?: boolean;
  initialPcdCount?: number;
  initialPcdDescription?: string;
  onUpdate?: (data: { adults: number; children: number; hasPcd: boolean; pcdCount: number; pcdDescription: string }) => void;
}

export default function GuestSelector({
  initialAdults = 1,
  initialChildren = 0,
  initialPcd = false,
  initialPcdCount = 0,
  initialPcdDescription = '',
  onUpdate
}: GuestSelectorProps) {
  const t = useTranslations('Selectors.guests');
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [hasPcd, setHasPcd] = useState(initialPcd);
  const [pcdCount, setPcdCount] = useState(initialPcdCount);
  const [pcdDescription, setPcdDescription] = useState(initialPcdDescription);
  const [isOpen, setIsOpen] = useState(false);

  const notify = () => {
    if (onUpdate) {
      onUpdate({ adults, children, hasPcd, pcdCount, pcdDescription });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-md transition text-sm text-white flex flex-col items-start min-w-[150px]"
      >
        <span className="text-[10px] uppercase font-bold text-white/70">{t('label')}</span>
        <span>{t('summary', { adults, children })}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white shadow-xl border border-gray-200 rounded-lg p-6 w-80 z-[60] text-gray-800 animate-in fade-in zoom-in duration-200">
          <div className="space-y-4">
            {/* Adultos */}
            <div className="flex items-center justify-between">
              <label className="font-medium">{t('adults')}</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setAdults(Math.max(1, adults - 1)); notify(); }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >-</button>
                <span className="w-4 text-center font-bold">{adults}</span>
                <button
                  type="button"
                  onClick={() => { setAdults(adults + 1); notify(); }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >+</button>
              </div>
            </div>

            {/* Crianças (limitado a 0-4) */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium block">{t('children')}</label>
                <span className="text-xs text-gray-500">{t('childrenAge')}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setChildren(Math.max(0, children - 1)); notify(); }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >-</button>
                <span className="w-4 text-center font-bold">{children}</span>
                <button
                  type="button"
                  onClick={() => { setChildren(Math.min(4, children + 1)); notify(); }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >+</button>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* PCD (Quantidade e Texto Livre) */}
            <div className="space-y-3">
              <label className="font-medium block text-sm">{t('pcd')}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={hasPcd === true}
                    onChange={() => { setHasPcd(true); notify(); }}
                    className="text-azul-principal focus:ring-azul-principal"
                  />
                  <span>{t('yes')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={hasPcd === false}
                    onChange={() => { setHasPcd(false); setPcdCount(0); setPcdDescription(''); notify(); }}
                    className="text-azul-principal focus:ring-azul-principal"
                  />
                  <span>{t('no')}</span>
                </label>
              </div>

              {hasPcd && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">{t('pcdCount')}</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setPcdCount(Math.max(1, pcdCount - 1)); notify(); }}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-xs"
                      >-</button>
                      <span className="text-sm font-bold">{pcdCount}</span>
                      <button
                        type="button"
                        onClick={() => { setPcdCount(pcdCount + 1); notify(); }}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-xs"
                      >+</button>
                    </div>
                  </div>
                  <textarea
                    value={pcdDescription}
                    onChange={(e) => { setPcdDescription(e.target.value); notify(); }}
                    placeholder={t('pcdDescription')}
                    className="w-full border border-gray-300 rounded p-2 text-sm h-20 focus:ring-2 focus:ring-azul-principal outline-none"
                  />
                  <div className="p-2 bg-red-50 border border-red-100 rounded text-[10px] text-red-600 font-medium">
                    {t('elevatorWarning')}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full bg-azul-principal text-white py-2 rounded-md font-bold hover:bg-blue-700 transition"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
