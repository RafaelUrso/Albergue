'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';

export default function ResultsFilters({ sParams }: { sParams: Record<string, string> }) {
  const t = useTranslations('Booking.results');
  const router = useRouter();
  const { locale } = useParams();

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(sParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    router.push(`/${locale}/booking/results?${newParams.toString()}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
      <h2 className="font-bold mb-4 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {t('filters')}
      </h2>

      <div className="space-y-6">
        {/* Gênero */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">{t('gender')}</label>
          <select
            value={sParams.gender || 'ALL'}
            onChange={(e) => updateFilter('gender', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-azul-principal"
          >
            <option value="ALL">{t('mixed')}</option>
            <option value="MASCULINO">{t('male')}</option>
            <option value="FEMININO">{t('female')}</option>
          </select>
        </div>

        {/* Banheiro */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">{t('bathroom')}</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="bathroom"
                checked={sParams.banheiroPrivativo === 'true'}
                onChange={() => updateFilter('banheiroPrivativo', 'true')}
                className="text-azul-principal"
              />
              {t('private')}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="bathroom"
                checked={sParams.banheiroPrivativo === 'false'}
                onChange={() => updateFilter('banheiroPrivativo', 'false')}
                className="text-azul-principal"
              />
              {t('shared')}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="bathroom"
                checked={!sParams.banheiroPrivativo}
                onChange={() => updateFilter('banheiroPrivativo', '')}
                className="text-azul-principal"
              />
              Todos
            </label>
          </div>
        </div>

        {/* Posição */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Posição</label>
          <select
            value={sParams.posicao || ''}
            onChange={(e) => updateFilter('posicao', e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-azul-principal"
          >
            <option value="">Todas</option>
            <option value="BELICHE_SUPERIOR">Beliche Superior</option>
            <option value="BELICHE_INFERIOR">Beliche Inferior</option>
            <option value="CAMA_SIMPLES">Cama Simples</option>
          </select>
        </div>
      </div>
    </div>
  );
}
