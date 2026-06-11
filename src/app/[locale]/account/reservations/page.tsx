'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { getUserReservations, calculateRefund, cancelReservation } from '@/lib/actions/cancellation';
import { submitFeedback } from '@/lib/actions/feedback';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { formatDisplayDate } from '@/lib/date-utils';

interface Reservation {
  id: string;
  status: string;
  dataCheckin: Date;
  dataCheckout: Date;
  valorTotal: number;
  valorPago: number;
  leitos: Array<{
    id: string;
    leito: {
      codigo: string;
      quarto: {
        nome: string;
      };
    };
  }>;
  cancelamento: {
    valorEstornado: number;
    taxaRetida: number;
  } | null;
  hasFeedback: boolean;
}

export default function ReservationsPage() {
  const t = useTranslations('Account.reservations');
  const tCommon = useTranslations('Enums');
  const { status } = useSession();
  const router = useRouter();
  const { locale } = useParams();

  const [reservations, setReservations] = useState<Reservation[]>([]);
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

  // Feedback state
  const [feedbackResId, setFeedbackResId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
    }
  }, [status, locale, router]);

  const loadReservations = async () => {
    try {
      const data = await getUserReservations();
      setReservations(data as unknown as Reservation[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getUserReservations().then(data => {
      if (isMounted) {
        setReservations(data as unknown as Reservation[]);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (isMounted) setLoading(false);
    });
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackResId) return;
    setProcessing(true);
    try {
      await submitFeedback({
        reservaId: feedbackResId,
        nota: feedbackRating,
        comentario: feedbackComment
      });
      setFeedbackResId(null);
      loadReservations();
      alert(t('feedbackSubmitted'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error submitting feedback');
    } finally {
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) return <div className="p-8 pt-24 text-center">{t('loading')}</div>;

  return (
    <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-azul-principal">{t('title')}</h1>

      <div className="space-y-6">
        {reservations.map((reserva) => (
          <div key={reserva.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg flex flex-col md:flex-row justify-between gap-6 transition hover:border-blue-200">
            <div className="flex-grow space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-black text-xl text-gray-800">#{reserva.id.slice(0, 8)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  reserva.status === 'CONFIRMADA' ? 'bg-green-100 text-green-700' :
                  reserva.status === 'CANCELADA' ? 'bg-red-100 text-red-700' :
                  reserva.status === 'CHECKOUT' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {tCommon(`ReservaStatus.${reserva.status}`)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">{t('details.period')}</p>
                  <p className="text-gray-700 font-medium">
                    {formatDisplayDate(new Date(reserva.dataCheckin), locale as string)} — {formatDisplayDate(new Date(reserva.dataCheckout), locale as string)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">{t('details.paid')}</p>
                  <p className="text-azul-principal font-bold">
                    {new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(reserva.valorTotal)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-400 uppercase font-bold mb-2">{t('beds')}</p>
                <div className="flex flex-wrap gap-2">
                  {reserva.leitos.map((rl) => (
                    <span key={rl.id} className="bg-gray-50 text-xs px-3 py-1.5 rounded-lg border border-gray-100 font-medium text-gray-600">
                      {rl.leito.quarto.nome} - {rl.leito.codigo}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
              <div className="flex flex-col gap-2 w-full">
                {reserva.status === 'CONFIRMADA' && (
                  <button
                    onClick={() => handleStartCancel(reserva.id)}
                    className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-red-700 transition shadow-sm"
                  >
                    {t('cancel')}
                  </button>
                )}

                {reserva.status === 'CHECKOUT' && !reserva.hasFeedback && (
                  <button
                    onClick={() => setFeedbackResId(reserva.id)}
                    className="w-full bg-azul-principal text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition shadow-sm"
                  >
                    {t('leaveFeedback')}
                  </button>
                )}

                {reserva.hasFeedback && (
                  <div className="text-right text-green-600 font-bold text-sm flex items-center gap-1 justify-end">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Avaliado
                  </div>
                )}
              </div>

              {reserva.status === 'CANCELADA' && reserva.cancelamento && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 w-full">
                  <div className="flex justify-between text-xs text-red-700 mb-1">
                    <span>{t('refunded')}</span>
                    <span className="font-bold">{new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(reserva.cancelamento.valorEstornado)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-400">
                    <span>{t('fee')}</span>
                    <span>{new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(reserva.cancelamento.taxaRetida)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {reservations.length === 0 && (
          <div className="bg-gray-50 p-16 text-center rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
            <p className="text-gray-500 font-medium">{t('noReservations')}</p>
          </div>
        )}
      </div>

      {/* Modal de Feedback */}
      {feedbackResId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('leaveFeedback')}</h2>
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 tracking-wide uppercase">Nota de 1 a 5</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFeedbackRating(num)}
                      className={`w-12 h-12 rounded-xl font-black transition-all ${
                        feedbackRating === num
                          ? 'bg-yellow-400 text-white shadow-lg scale-110'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 tracking-wide uppercase">Seu comentário</label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azul-principal outline-none min-h-[120px]"
                  placeholder="Conte-nos como foi sua experiência..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-grow bg-azul-principal text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition disabled:opacity-50 shadow-md"
                >
                  {processing ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackResId(null)}
                  className="px-6 text-gray-500 font-bold hover:text-gray-700"
                >
                  {t('back')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {cancellingId && refundInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-200">
            {step === 1 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('cancelConfirmTitle')}</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-2xl space-y-3 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>{t('totalAmount')}</span>
                      <span className="font-bold">{new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(refundInfo.valorTotal)}</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>{t('feeToRetain')}</span>
                      <span>- {new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(refundInfo.taxaRetida)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between text-green-600 font-black text-xl">
                      <span>{t('estimatedRefund')}</span>
                      <span>{new Intl.NumberFormat(locale as string, { style: 'currency', currency: 'BRL' }).format(refundInfo.valorEstornado)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      <strong>{t('policyApplied')}:</strong> {t(`policies.${refundInfo.politicaAplicada}`)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-red-700 transition shadow-lg"
                  >
                    {t('proceed')}
                  </button>
                  <button
                    onClick={() => setCancellingId(null)}
                    className="w-full text-gray-500 py-2 font-bold hover:text-gray-700"
                  >
                    {t('keepReservation')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-red-600">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('finalConfirmation')}</h2>
                <p className="text-gray-600 leading-relaxed">{t('finalWarning')}</p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleConfirmCancel}
                    disabled={processing}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-red-700 transition disabled:opacity-50 shadow-lg"
                  >
                    {processing ? t('processing') : t('confirmCancellation')}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full text-gray-500 py-2 font-bold hover:text-gray-700"
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
