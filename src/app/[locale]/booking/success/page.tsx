import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ bookingId: string }>;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale } = await params;
  const sParams = await searchParams;
  const t = await getTranslations('Booking.success');

  return (
    <div className="pt-32 pb-12 px-4 max-w-2xl mx-auto text-center">
      <div className="mb-8 flex justify-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-4">{t('title')}</h1>
      <p className="text-xl text-gray-600 mb-12">{t('message')}</p>

      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200 mb-12">
        <p className="text-sm text-gray-500 uppercase font-bold tracking-widest mb-2">{t('bookingNumber')}</p>
        <p className="text-3xl font-mono font-bold text-azul-principal">{sParams.bookingId}</p>
      </div>

      <Link
        href={`/${locale}`}
        className="inline-block bg-azul-principal text-white px-12 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
