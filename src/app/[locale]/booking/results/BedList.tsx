'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Bed {
  id: string;
  codigo: string;
  posicao: string;
  localizacao: string;
  valorDiaria: number;
  quarto: {
    nome: string;
    tipo: string;
    banheiroPrivativo: boolean;
    genero: string;
  };
}

export default function BedList({
  leitos,
  sParams
}: {
  leitos: Bed[],
  sParams: Record<string, string>
}) {
  const t = useTranslations('Booking.results');
  const router = useRouter();
  const { locale } = useParams();
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const adultsNeeded = parseInt(sParams.adults);

  const toggleBed = (id: string) => {
    setSelectedBeds(prev =>
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    const query = new URLSearchParams({
      ...sParams,
      selectedBeds: selectedBeds.join(',')
    }).toString();
    router.push(`/${locale}/booking/select?${query}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-azul-principal text-white p-4 rounded-xl flex justify-between items-center sticky top-20 z-30 shadow-lg">
        <div>
          <p className="font-bold">{selectedBeds.length} de {adultsNeeded} leitos selecionados</p>
          {selectedBeds.length < adultsNeeded && (
            <p className="text-xs opacity-80">Selecione mais {adultsNeeded - selectedBeds.length} para continuar</p>
          )}
        </div>
        <button
          disabled={selectedBeds.length === 0}
          onClick={handleContinue}
          className={`px-8 py-2 rounded-lg font-bold transition ${
            selectedBeds.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {t('select')}
        </button>
      </div>

      <div className="space-y-4">
        {leitos.map((leito) => (
          <div
            key={leito.id}
            onClick={() => toggleBed(leito.id)}
            className={`bg-white p-6 rounded-xl border-2 transition cursor-pointer flex flex-col md:flex-row justify-between items-center gap-6 ${
              selectedBeds.includes(leito.id) ? 'border-azul-principal bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedBeds.includes(leito.id) ? 'bg-azul-principal border-azul-principal' : 'border-gray-300'
              }`}>
                {selectedBeds.includes(leito.id) && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-azul-principal">{leito.codigo}</h3>
                <p className="text-gray-600 text-sm">
                  {leito.quarto.nome} - {leito.quarto.tipo.replace('TIPO_', '').replace('_', ' ')}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase text-gray-600">
                    {leito.posicao.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase text-gray-600">
                    {leito.quarto.banheiroPrivativo ? t('private') : t('shared')}
                  </span>
                  <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase text-gray-600">
                    {t(leito.quarto.genero.toLowerCase())}
                  </span>
                  <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase text-gray-600">
                    {leito.localizacao.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Diária estimada</p>
              <p className="text-xl font-black text-azul-principal">R$ {leito.valorDiaria.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
