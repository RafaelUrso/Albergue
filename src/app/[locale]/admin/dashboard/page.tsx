'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const t = useTranslations('Admin');
  const { locale } = useParams();

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href={`/${locale}/admin/tariffs`}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-azul-principal transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-azul-principal mb-4 group-hover:bg-azul-principal group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">{t('tariffs.title')}</h2>
          <p className="text-gray-500 text-sm">Gerencie valores de diárias, períodos sazonais e promoções.</p>
        </Link>

        <Link
          href={`/${locale}/admin/settings`}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-azul-principal transition-all group"
        >
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">{t('settings.title')}</h2>
          <p className="text-gray-500 text-sm">Configure políticas de cancelamento e taxas de conveniência.</p>
        </Link>
      </div>
    </div>
  );
}
