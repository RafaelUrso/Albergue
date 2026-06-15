'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import DateRangeSelector from './DateRangeSelector';
import GuestSelector from './GuestSelector';
import Link from 'next/link';
import { useCallback } from 'react';

export default function TopBar() {
  const t = useTranslations('TopBar');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const currentLocale = pathname.split('/')[1] || 'pt-BR';
  const isBookingPage = pathname.includes('/booking/results');
  const userPerfil = (session?.user as { perfil?: string })?.perfil;
  const isAdmin = session?.user && ['ADMIN_GERAL', 'ADMIN_FINANCEIRO'].includes(userPerfil || '');
  const isReception = session?.user && ['ADMIN_GERAL', 'RECEPCIONISTA'].includes(userPerfil || '');

  const toggleLanguage = () => {
    const newLocale = pathname.startsWith('/en') ? 'pt-BR' : 'en';
    const newPath = pathname.replace(/^\/(en|pt-BR)/, `/${newLocale}`);
    const query = searchParams.toString();
    const finalPath = query ? `${newPath}?${query}` : newPath;
    router.push(finalPath || `/${newLocale}`);
  };

  const handleSearchUpdate = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    if (isBookingPage) {
      router.push(`${pathname}?${params.toString()}`);
    } else {
      // Se não estiver na página de resultados, redireciona para lá ao mudar algo importante?
      // Ou apenas guarda no estado global? Por simplicidade aqui, se mudar, vamos para resultados.
      router.push(`/${currentLocale}/booking/results?${params.toString()}`);
    }
  }, [searchParams, pathname, router, currentLocale, isBookingPage]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-azul-principal text-white flex items-center px-4 md:px-8 z-50 shadow-md">
      {/* Esquerda: Nome do Hostel */}
      <Link href={`/${currentLocale}`} className="flex-shrink-0 font-bold text-xl uppercase tracking-wider hover:opacity-80 transition">
        {t('hostelName')}
      </Link>

      {/* Centro: Busca Rápida */}
      <div className="flex-grow flex justify-center gap-4 hidden md:flex items-center">
        <DateRangeSelector
          initialCheckIn={searchParams.get('checkIn') || undefined}
          initialCheckOut={searchParams.get('checkOut') || undefined}
          onSelect={(checkIn, checkOut) => handleSearchUpdate({ checkIn, checkOut })}
        />
        <GuestSelector
          initialAdults={parseInt(searchParams.get('adults') || '1')}
          initialChildren={parseInt(searchParams.get('children') || '0')}
          initialPcd={searchParams.get('hasPcd') === 'true'}
          initialPcdCount={parseInt(searchParams.get('pcdCount') || '0')}
          initialPcdDescription={searchParams.get('pcdDescription') || ''}
          onUpdate={(data) => handleSearchUpdate({
            adults: data.adults.toString(),
            children: data.children.toString(),
            hasPcd: data.hasPcd.toString(),
            pcdCount: data.pcdCount.toString(),
            pcdDescription: data.pcdDescription
          })}
        />
      </div>

      {/* Direita: Perfil, Config, Idioma */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {session ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden lg:flex">
              <span className="text-sm font-bold">{session.user?.name}</span>
              <div className="flex gap-2">
                {isAdmin && (
                  <Link href={`/${currentLocale}/admin/dashboard`} className="text-[10px] uppercase font-black hover:underline text-white/80">
                    {t('adminPanel')}
                  </Link>
                )}
                {isReception && (
                  <Link href={`/${currentLocale}/reception`} className="text-[10px] uppercase font-black hover:underline text-white/80">
                    {t('reception')}
                  </Link>
                )}
                <Link href={`/${currentLocale}/account/reservations`} className="text-[10px] uppercase font-black hover:underline text-white/80">
                  {t('myReservations')}
                </Link>
                <Link href={`/${currentLocale}/account/profile`} className="text-[10px] uppercase font-black hover:underline text-white/80">
                  {t('profile')}
                </Link>
              </div>
            </div>

            {/* Mobile/Small Screens Links */}
            <div className="lg:hidden flex items-center gap-2">
               <Link href={`/${currentLocale}/account/profile`} title={t('profile')} className="hover:bg-white/10 p-1 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
               </Link>
               <Link href={`/${currentLocale}/account/reservations`} title={t('myReservations')} className="hover:bg-white/10 p-1 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
               </Link>
            </div>

            <button
              onClick={() => signOut()}
              className="hover:bg-white/10 p-2 rounded-full transition"
              title={t('logout')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <Link
            href={`/${currentLocale}/auth/login`}
            className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded transition text-sm font-bold"
          >
            {t('login')}
          </Link>
        )}

        <button
          onClick={toggleLanguage}
          className="bg-white text-azul-principal font-bold px-3 py-1 rounded hover:bg-opacity-90 transition text-sm focus:ring-2 focus:ring-white focus:outline-none"
          aria-label={t('language')}
        >
          {t('language')}
        </button>
      </div>
    </header>
  );
}
