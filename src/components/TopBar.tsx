'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function TopBar() {
  const t = useTranslations('TopBar');
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = pathname.startsWith('/en') ? 'pt-BR' : 'en';
    const newPath = pathname.replace(/^\/(en|pt-BR)/, `/${newLocale}`);
    router.push(newPath || `/${newLocale}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-azul-principal text-white flex items-center px-4 md:px-8 z-50">
      {/* Esquerda: Nome do Hostel */}
      <div className="flex-shrink-0 font-bold text-xl uppercase tracking-wider">
        {t('hostelName')}
      </div>

      {/* Centro: Busca Rápida (Placeholders) */}
      <div className="flex-grow flex justify-center gap-4 hidden md:flex">
        <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition text-sm">
          {t('search.dates')}
        </button>
        <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition text-sm">
          {t('search.guests')}
        </button>
      </div>

      {/* Direita: Perfil, Config, Idioma */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <button className="hover:bg-white/10 p-2 rounded-full transition" title={t('profile')}>
          <span className="sr-only">{t('profile')}</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <button className="hover:bg-white/10 p-2 rounded-full transition" title={t('settings')}>
          <span className="sr-only">{t('settings')}</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={toggleLanguage}
          className="bg-white text-azul-principal font-bold px-3 py-1 rounded hover:bg-opacity-90 transition text-sm"
        >
          {t('language')}
        </button>
      </div>
    </header>
  );
}
