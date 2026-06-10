'use client';

import { useTranslations } from 'next-intl';
import { useState, use } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface SelectPageProps {
  searchParams: Promise<{
    checkIn: string;
    checkOut: string;
    adults: string;
    selectedBeds: string;
    children: string;
    hasPcd: string;
    pcdCount: string;
    pcdDescription: string;
  }>;
}

export default function SelectPage({ searchParams }: SelectPageProps) {
  const t = useTranslations('Booking.select');
  const router = useRouter();
  const { locale } = useParams();
  const sParams = use(searchParams);

  const numAdults = parseInt(sParams.adults);
  const bedIds = sParams.selectedBeds.split(',');

  // Se houver mais de um leito, precisamos coletar dados dos acompanhantes.
  // Assumimos que o titular ocupa o primeiro leito.
  const [companions, setCompanions] = useState(
    bedIds.slice(1).map(id => ({ leitoId: id, nomeCompleto: '', documento: '' }))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar se todos os campos estão preenchidos
    if (companions.some(c => !c.nomeCompleto || !c.documento)) {
      alert(t('validationError'));
      return;
    }

    const query = new URLSearchParams({
      ...sParams,
      companions: JSON.stringify(companions)
    }).toString();

    router.push(`/${locale}/booking/confirm?${query}`);
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {companions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-gray-600">{t('individual')}</p>
          </div>
        ) : (
          companions.map((comp, idx) => (
            <div key={comp.leitoId} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="font-bold text-azul-principal flex items-center gap-2">
                <span className="w-6 h-6 bg-azul-principal text-white rounded-full flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                {t('companion')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">{t('name')}</label>
                  <input
                    type="text"
                    required
                    value={comp.nomeCompleto}
                    onChange={(e) => {
                      const newComps = [...companions];
                      newComps[idx].nomeCompleto = e.target.value;
                      setCompanions(newComps);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-azul-principal outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">{t('document')}</label>
                  <input
                    type="text"
                    required
                    value={comp.documento}
                    onChange={(e) => {
                      const newComps = [...companions];
                      newComps[idx].documento = e.target.value;
                      setCompanions(newComps);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-azul-principal outline-none"
                  />
                </div>
              </div>
            </div>
          ))
        )}

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-600 font-bold hover:underline"
          >
            {t('back')}
          </button>
          <button
            type="submit"
            className="bg-red-600 text-white px-12 py-4 rounded-lg font-bold hover:bg-red-700 transition shadow-lg"
          >
            {t('continue')}
          </button>
        </div>
      </form>
    </div>
  );
}
