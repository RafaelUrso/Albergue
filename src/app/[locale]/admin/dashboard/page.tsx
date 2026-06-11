import { getDashboardStats } from "@/lib/actions/admin/dashboard";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  const perfil = (session?.user as { perfil?: string })?.perfil;

  if (!session || !['ADMIN_GERAL', 'ADMIN_FINANCEIRO'].includes(perfil || '')) {
    redirect(`/${locale}/auth/login`);
  }

  const stats = await getDashboardStats();
  const t = await getTranslations('Admin.dashboard');
  const ta = await getTranslations('Admin');

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">{t('activeReservations')}</p>
          <p className="text-4xl font-black text-azul-principal">{stats.activeReservationsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">{t('presentGuests')}</p>
          <p className="text-4xl font-black text-green-600">{stats.presentGuestsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">{t('revenue')} ({t('day')})</p>
          <p className="text-2xl font-black text-gray-900">R$ {stats.revenue.day.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">{t('revenue')} ({t('week')})</p>
          <p className="text-2xl font-black text-gray-900">R$ {stats.revenue.week.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase font-bold mb-1">{t('revenue')} ({t('month')})</p>
          <p className="text-2xl font-black text-gray-900">R$ {stats.revenue.month.toFixed(2)}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">{t('occupancyByType')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.occupancyByType.map((occ) => (
          <div key={occ.tipo} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-bold mb-2">{occ.tipo}</p>
            <div className="w-full bg-gray-100 rounded-full h-4">
              <div
                className="bg-azul-principal h-4 rounded-full"
                style={{ width: `${occ.percentage}%` }}
              ></div>
            </div>
            <p className="text-right text-sm mt-2 font-bold">{occ.percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href={`/${locale}/admin/reservations`}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-azul-principal transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-azul-principal mb-4 group-hover:bg-azul-principal group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Gestão de Reservas</h2>
          <p className="text-gray-500 text-sm">Visualize, filtre e altere status de reservas confirmadas.</p>
        </Link>

        {perfil === 'ADMIN_GERAL' && (
          <Link
            href={`/${locale}/admin/rooms`}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-azul-principal transition-all group"
          >
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Gestão de Quartos e Leitos</h2>
            <p className="text-gray-500 text-sm">CRUD de quartos e configuração individual de leitos.</p>
          </Link>
        )}

        <Link
          href={`/${locale}/admin/tariffs`}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-azul-principal transition-all group"
        >
          <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600 mb-4 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">{ta('tariffs.title')}</h2>
          <p className="text-gray-500 text-sm">Gerencie valores de diárias e períodos sazonais.</p>
        </Link>

        {perfil === 'ADMIN_GERAL' && (
          <Link
            href={`/${locale}/admin/feedback`}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-azul-principal transition-all group"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Moderação de Feedback</h2>
            <p className="text-gray-500 text-sm">Aprove ou rejeite comentários deixados pelos hóspedes.</p>
          </Link>
        )}

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
          <h2 className="text-xl font-bold mb-2">{ta('settings.title')}</h2>
          <p className="text-gray-500 text-sm">Configurações globais do sistema e políticas.</p>
        </Link>
      </div>
    </div>
  );
}
