'use client';

import { useTranslations } from 'next-intl';
import { useState, use, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBooking, calculateEstimatedPrice } from '@/lib/actions/booking';
import { useSession } from 'next-auth/react';

interface ConfirmPageProps {
  searchParams: Promise<{
    checkIn: string;
    checkOut: string;
    adults: string;
    children: string;
    selectedBeds: string;
    companions?: string;
    hasPcd: string;
    pcdCount: string;
    pcdDescription: string;
  }>;
}

export default function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const t = useTranslations('Booking.confirm');
  const router = useRouter();
  const { locale } = useParams();
  const { status } = useSession();
  const sParams = use(searchParams);

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const checkInDate = new Date(sParams.checkIn);
  const checkOutDate = new Date(sParams.checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const bedIds = sParams.selectedBeds.split(',');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await calculateEstimatedPrice(bedIds, sParams.checkIn, sParams.checkOut);
        setTotalPrice(price);
      } catch (err) {
        console.error("Failed to calculate price", err);
      }
    };
    fetchPrice();
  }, [bedIds, sParams.checkIn, sParams.checkOut]);

  // Redirecionar para login se não estiver logado
  if (status === 'unauthenticated') {
    const callbackUrl = encodeURIComponent(window.location.href);
    router.push(`/${locale}/auth/login?callbackUrl=${callbackUrl}`);
    return null;
  }

  const handleConfirm = async () => {
    if (!isTermsAccepted) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const companions = sParams.companions ? JSON.parse(sParams.companions) : [];

      const result = await createBooking({
        dataCheckin: sParams.checkIn,
        dataCheckout: sParams.checkOut,
        leitosIds: bedIds,
        acompanhantes: companions,
        declaracaoGrupo: {
          qtdAdultos: parseInt(sParams.adults),
          qtdCriancas: parseInt(sParams.children || '0'),
          possuiPcd: sParams.hasPcd === 'true',
          qtdPcd: parseInt(sParams.pcdCount || '0'),
          descricaoDeficiencias: sParams.pcdDescription,
        }
      });

      router.push(`/${locale}/booking/success?bookingId=${result.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro ao criar a reserva.';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-azul-principal text-white p-6">
          <h2 className="font-bold text-xl">{t('summary')}</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">{t('period')}</p>
              <p className="font-medium">
                {checkInDate.toLocaleDateString(locale as string)} — {checkOutDate.toLocaleDateString(locale as string)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">{t('nights')}</p>
              <p className="font-medium">{nights}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Leitos</p>
            <p className="font-medium">{bedIds.length} selecionado(s)</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <span className="font-bold text-lg">{t('total')}</span>
            <span className="text-2xl font-black text-azul-principal">
              {totalPrice !== null ? `R$ ${totalPrice.toFixed(2)}` : 'Calculando...'}
            </span>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 pt-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-azul-principal focus:ring-azul-principal"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">
                {t('termsAccept')}
              </span>
            </label>

            <button
              onClick={handleConfirm}
              disabled={!isTermsAccepted || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                isTermsAccepted && !isSubmitting
                ? 'bg-red-600 hover:bg-red-700 scale-[1.02] active:scale-100'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Processando...' : t('confirmButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
