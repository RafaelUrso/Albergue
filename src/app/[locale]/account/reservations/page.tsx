'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { getUserReservations, calculateRefund, cancelReservation } from '@/lib/actions/cancellation';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { formatDisplayDate } from '@/lib/date-utils';

export default function ReservationsPage() {
  const t = useTranslations('Account.reservations');
  const { status } = useSession();
  const router = useRouter();
  const { locale } = useParams();

  const [reservations, setReservations] = useState<{
    id: string;
    status: string;
    dataCheckin: Date;
    dataCheckout: Date;
    valorTotal: number;
    valorPago: number;
    leitos: { id: string }[];
    cancelamento: {
      valorEstornado: number;
      taxaRetida: number;
    } | null;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refundInfo, setRefundInfo] = useState<{
    valorTotal: number;
    valorEstornado: number;
    taxaRetida: number;
    politicaAplicada: string;
    diffDays: number;
  } | null>(null);
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
    }
  }, [status, locale, router]);

  const loadReservations = async () => {
    try {
      const data = await getUserReservations();
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchReservations = async () => {
      try {
        const data = await getUserReservations();
        if (isMounted) setReservations(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReservations();
    return () => { isMounted = false; };
  }, []);

  const handleStartCancel = async (id: string) => {
    setCancellingId(id);
    setStep(1);
    try {
      const info = await calculateRefund(id);
      setRefundInfo(info);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error calculating refund');
      setCancellingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingId) return;
    setProcessing(true);
    try {
      await cancelReservation(cancellingId);
      setCancellingId(null);
      setRefundInfo(null);
      loadReservations();
      alert(t('cancelSuccess'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error cancelling');
    } finally {
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) return <div className="p-8 pt-24">{t('loading')}</div>;

  return (
    <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="space-y-4">
        {reservations.map((reserva) => (
          <div key={reserva.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">#{reserva.id.slice(0, 8)}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  reserva.status === 'CONFIRMADA' ? 'bg-green-100 text-green-700' :
                  reserva.status === 'CANCELADA' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {reserva.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                {formatDisplayDate(reserva.dataCheckin, locale as string)} — {formatDisplayDate(reserva.dataCheckout, locale as string)}
              </p>
              <p className="text-sm font-medium">
                {reserva.leitos.length} {t('beds')} • {new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(reserva.valorTotal)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {reserva.status === 'CONFIRMADA' && (
                <button
                  onClick={() => handleStartCancel(reserva.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition"
                >
                  {t('cancel')}
                </button>
              )}
              {reserva.status === 'CANCELADA' && reserva.cancelamento && (
                <div className="text-right text-xs text-gray-500">
                  <p>{t('refunded')}: {new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(reserva.cancelamento.valorEstornado)}</p>
                  <p>{t('fee')}: {new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(reserva.cancelamento.taxaRetida)}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {reservations.length === 0 && (
          <div className="bg-gray-50 p-12 text-center rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">{t('noReservations')}</p>
          </div>
        )}
      </div>

      {/* Modal de Cancelamento */}
      {cancellingId && refundInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            {step === 1 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('cancelConfirmTitle')}</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('totalAmount')}</span>
                      <span className="font-bold">{new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(refundInfo.valorTotal)}</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>{t('feeToRetain')}</span>
                      <span>- {new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(refundInfo.taxaRetida)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-green-600 font-bold text-lg">
                      <span>{t('estimatedRefund')}</span>
                      <span>{new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(refundInfo.valorEstornado)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    <strong>{t('policyApplied')}:</strong> {t(`policies.${refundInfo.politicaAplicada}`)}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition"
                  >
                    {t('proceed')}
                  </button>
                  <button
                    onClick={() => setCancellingId(null)}
                    className="w-full text-gray-500 py-2 font-medium"
                  >
                    {t('keepReservation')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('finalConfirmation')}</h2>
                <p className="text-gray-600">{t('finalWarning')}</p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleConfirmCancel}
                    disabled={processing}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {processing ? t('processing') : t('confirmCancellation')}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full text-gray-500 py-2 font-medium"
                  >
                    {t('back')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
