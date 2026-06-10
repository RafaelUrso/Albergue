import { getTranslations } from 'next-intl/server';
import { searchAvailableBeds } from '@/lib/actions/booking';
import BedList from './BedList';
import ResultsFilters from './ResultsFilters';
import { QuartoGenero, LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol } from '@prisma/client';

interface ResultsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    checkIn: string;
    checkOut: string;
    adults: string;
    children: string;
    hasPcd: string;
    pcdCount: string;
    pcdDescription: string;
    gender?: string;
    banheiroPrivativo?: string;
    posicao?: string;
    localizacao?: string;
    incidenciaSol?: string;
  }>;
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { locale } = await params;
  const sParams = await searchParams;
  const t = await getTranslations('Booking.results');

  const leitos = await searchAvailableBeds({
    checkIn: sParams.checkIn,
    checkOut: sParams.checkOut,
    adults: parseInt(sParams.adults),
    gender: sParams.gender as QuartoGenero | 'ALL',
    banheiroPrivativo: sParams.banheiroPrivativo === 'true' ? true : sParams.banheiroPrivativo === 'false' ? false : undefined,
    posicao: sParams.posicao as LeitoPosicao,
    localizacao: sParams.localizacao as LeitoLocalizacao,
    incidenciaSol: sParams.incidenciaSol as LeitoIncidenciaSol,
  });

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600">
            {new Date(sParams.checkIn).toLocaleDateString(locale)} — {new Date(sParams.checkOut).toLocaleDateString(locale)} • {sParams.adults} Adultos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtros Sidebar */}
        <aside className="lg:col-span-1">
          <ResultsFilters sParams={sParams} />
        </aside>

        {/* Lista de Leitos */}
        <main className="lg:col-span-3">
          {leitos.length === 0 ? (
            <div className="bg-blue-50 p-12 text-center rounded-xl border border-blue-100">
              <p className="text-blue-700 font-medium">{t('noResults')}</p>
            </div>
          ) : (
            <BedList leitos={leitos} sParams={sParams} />
          )}
        </main>
      </div>
    </div>
  );
}
