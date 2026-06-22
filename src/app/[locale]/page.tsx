'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DateRangeSelector from '@/components/DateRangeSelector';
import GuestSelector from '@/components/GuestSelector';
import ActiveGuestCounter from '@/components/ActiveGuestCounter';
import Image from 'next/image';
import Link from 'next/link';
import HomeReviews from '@/components/HomeReviews';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const { locale } = useParams();

  const [searchParams, setSearchParams] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(new Date().getTime() + 86400000).toISOString().split('T')[0],
    adults: 1,
    children: 0,
    hasPcd: false,
    pcdCount: 0,
    pcdDescription: ''
  });

  const handleSearch = () => {
    const query = new URLSearchParams({
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      adults: searchParams.adults.toString(),
      children: searchParams.children.toString(),
      hasPcd: searchParams.hasPcd.toString(),
      pcdCount: searchParams.pcdCount.toString(),
      pcdDescription: searchParams.pcdDescription
    }).toString();

    router.push(`/${locale}/booking/results?${query}`);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-azul-principal text-white px-4">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <Image
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop"
            alt="Interior do Albergue Sr. Almeida em Santa Teresa"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            {t('description')}
          </p>

          {/* Search Box */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl flex flex-col lg:flex-row items-stretch gap-4 text-gray-800 mt-12 max-w-full overflow-hidden">
            <div className="flex-grow">
              <DateRangeSelector
                initialCheckIn={searchParams.checkIn}
                initialCheckOut={searchParams.checkOut}
                onSelect={(checkIn, checkOut) => setSearchParams(prev => ({ ...prev, checkIn, checkOut }))}
              />
            </div>
            <div className="flex-grow">
              <GuestSelector
                initialAdults={searchParams.adults}
                initialChildren={searchParams.children}
                onUpdate={(data) => setSearchParams(prev => ({ ...prev, ...data }))}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('search')}
            </button>
          </div>

          {/* Active Guest Counter (Compact and centered) */}
          <div className="mt-8 flex justify-center">
            <ActiveGuestCounter />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="w-12 h-12 bg-blue-100 text-azul-principal rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4">{t('features.location.title')}</h3>
            <p className="text-gray-600 flex-grow">{t('features.location.description')}</p>
            <Link href={`/${locale}/map`} className="mt-6 text-azul-principal font-bold hover:underline flex items-center gap-2">
               {t('features.location.link')}
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </Link>
          </div>
          <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4">{t('features.community.title')}</h3>
            <p className="text-gray-600 flex-grow">{t('features.community.description')}</p>
            <Link href={`/${locale}/feedback`} className="mt-6 text-azul-principal font-bold hover:underline flex items-center gap-2">
               {t('features.community.link')}
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </Link>
          </div>
          <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4">{t('features.security.title')}</h3>
            <p className="text-gray-600 flex-grow">{t('features.security.description')}</p>
            <Link href={`/${locale}/amenities`} className="mt-6 text-azul-principal font-bold hover:underline flex items-center gap-2">
               {t('features.security.link')}
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </Link>
          </div>
        </div>

        {/* Feedback Section */}
        <HomeReviews />

        {/* Categories / Rooms Quick Links */}
        <div className="bg-azul-principal rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tight">{t('rooms.title')}</h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {t('rooms.description')}
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                 <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">{t('rooms.types.4beds')}</span>
                 <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">{t('rooms.types.8beds')}</span>
                 <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">{t('rooms.types.12beds')}</span>
              </div>
              <Link href={`/${locale}/rooms`} className="inline-block bg-white text-azul-principal font-black px-8 py-4 rounded-xl hover:bg-opacity-90 transition shadow-xl uppercase tracking-widest text-sm">
                {t('rooms.link')}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="h-40 bg-white/10 rounded-2xl"></div>
               <div className="h-40 bg-white/10 rounded-2xl translate-y-8"></div>
               <div className="h-40 bg-white/10 rounded-2xl -translate-y-4"></div>
               <div className="h-40 bg-white/10 rounded-2xl translate-y-4"></div>
            </div>
          </div>
        </div>

        {/* Footer info link */}
        <div className="mt-20 text-center space-y-4">
           <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{t('footer.title')}</h3>
           <p className="text-gray-500 max-w-lg mx-auto">
              {t('footer.description')}
           </p>
           <div className="flex justify-center gap-6 pt-4">
              <Link href={`/${locale}/rules`} className="text-azul-principal font-bold hover:underline">{t('footer.rules')}</Link>
              <Link href={`/${locale}/contact`} className="text-azul-principal font-bold hover:underline">{t('footer.contact')}</Link>
           </div>
        </div>
      </section>
    </main>
  );
}
