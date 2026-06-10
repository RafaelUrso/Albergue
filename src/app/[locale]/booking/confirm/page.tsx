'use client';

import { useTranslations } from 'next-intl';
import { useState, use, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBooking, calculateEstimatedPrice, processPayment } from '@/lib/actions/booking';
import { useSession } from 'next-auth/react';
import { formatDisplayDate } from '@/lib/date-utils';

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
  const tp = useTranslations('Booking.payment');
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
  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(window.location.href);
      router.push(`/${locale}/auth/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, locale, router]);

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });

  if (status === 'unauthenticated' || status === 'loading') {
    return (
      <div className="pt-24 pb-12 px-4 text-center">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!isTermsAccepted) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const companions = sParams.companions ? JSON.parse(sParams.companions) : [];

      // 1. Criar Reserva
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

      // 2. Processar Pagamento (Mock)
      // Usamos o número do cartão como o "token" para o nosso mock
      await processPayment(result.id, paymentData.cardNumber);

      router.push(`/${locale}/booking/success?bookingId=${result.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errorDefault');
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
                {formatDisplayDate(sParams.checkIn, locale as string)} — {formatDisplayDate(sParams.checkOut, locale as string)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">{t('nights')}</p>
              <p className="font-medium">{nights}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">{t('beds')}</p>
            <p className="font-medium">{t('bedsSelected', { count: bedIds.length })}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <span className="font-bold text-lg">{t('total')}</span>
            <span className="text-2xl font-black text-azul-principal">
              {totalPrice !== null
                ? new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(totalPrice)
                : t('calculating')}
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-700">{tp('title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">{tp('cardNumber')}</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={paymentData.cardNumber}
                  onChange={e => setPaymentData({...paymentData, cardNumber: e.target.value})}
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">{tp('mockHint')}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">{tp('expiry')}</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={paymentData.expiry}
                  onChange={e => setPaymentData({...paymentData, expiry: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">{tp('cvv')}</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={paymentData.cvv}
                  onChange={e => setPaymentData({...paymentData, cvv: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">{tp('cardName')}</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 mt-1"
                  value={paymentData.cardName}
                  onChange={e => setPaymentData({...paymentData, cardName: e.target.value})}
                  required
                />
              </div>
            </div>
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
              {isSubmitting ? t('processing') : t('confirmButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
