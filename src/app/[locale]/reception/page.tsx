import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ReservaStatus } from "@prisma/client";
import { updateReservationStatus } from "@/lib/actions/admin/reservations";
import Link from "next/link";

export default async function ReceptionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  const perfil = (session?.user as { perfil?: string })?.perfil;

  if (!session || !['ADMIN_GERAL', 'RECEPCIONISTA'].includes(perfil || '')) {
    redirect(`/${locale}/auth/login`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkins = await prisma.reserva.findMany({
    where: {
      dataCheckin: { gte: today, lt: tomorrow },
      status: ReservaStatus.CONFIRMADA
    },
    include: {
      usuarioTitular: true,
      leitos: { include: { leito: { include: { quarto: true } } } },
      declaracaoGrupo: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const checkouts = await prisma.reserva.findMany({
    where: {
      dataCheckout: { gte: today, lt: tomorrow },
      status: ReservaStatus.CHECKIN
    },
    include: {
      usuarioTitular: true,
      leitos: { include: { leito: { include: { quarto: true } } } },
      declaracaoGrupo: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const t = await getTranslations('Reception');

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href={`/${locale}/reception/register`} className="bg-azul-principal text-white px-6 py-2 rounded font-bold hover:opacity-90 transition">
          {t('registerGuest')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHECK-INS */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            {t('todayCheckins')}
          </h2>
          <div className="space-y-4">
            {checkins.length === 0 && <p className="text-gray-500 italic">{t('noArrivals')}</p>}
            {checkins.map(reserva => (
              <ReservationCard key={reserva.id} reserva={reserva} type="checkin" locale={locale} />
            ))}
          </div>
        </section>

        {/* CHECK-OUTS */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            {t('todayCheckouts')}
          </h2>
          <div className="space-y-4">
            {checkouts.length === 0 && <p className="text-gray-500 italic">{t('noDepartures')}</p>}
            {checkouts.map(reserva => (
              <ReservationCard key={reserva.id} reserva={reserva} type="checkout" locale={locale} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import { Usuario, Leito, Quarto, DeclaracaoGrupo } from "@prisma/client";

interface ReservaWithDetails {
  id: string;
  usuarioTitular: Usuario;
  leitos: Array<{
    leito: Leito & {
      quarto: Quarto;
    };
  }>;
  declaracaoGrupo: DeclaracaoGrupo | null;
}

function ReservationCard({ reserva, type }: { reserva: ReservaWithDetails, type: 'checkin' | 'checkout', locale: string }) {
  const hasAlert = (reserva.declaracaoGrupo?.qtdCriancas || 0) > 0 || reserva.declaracaoGrupo?.possuiPcd;

  return (
    <div className={`p-4 rounded-xl border shadow-sm ${hasAlert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-lg">{reserva.usuarioTitular.nomeCompleto}</p>
          <p className="text-xs text-gray-500 font-mono">{reserva.id}</p>
        </div>
        <form action={async () => {
          'use server';
          await updateReservationStatus(reserva.id, type === 'checkin' ? ReservaStatus.CHECKIN : ReservaStatus.CHECKOUT);
        }}>
          <button type="submit" className={`px-4 py-2 rounded font-black text-xs uppercase transition ${
            type === 'checkin' ? 'bg-azul-principal text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700'
          }`}>
            {type === 'checkin' ? 'Check-in' : 'Check-out'}
          </button>
        </form>
      </div>

      <div className="text-sm space-y-1 mb-4">
        <p><strong>Leitos:</strong> {reserva.leitos.map((l) => l.leito.codigo).join(', ')}</p>
        <p><strong>Quarto(s):</strong> {Array.from(new Set(reserva.leitos.map((l) => l.leito.quarto.nome))).join(', ')}</p>
      </div>

      {hasAlert && (
        <div className="p-3 bg-red-100 border border-red-200 rounded text-red-800 text-xs">
          <p className="font-bold mb-1 uppercase">⚠️ Alerta de Atendimento Especial:</p>
          {reserva.declaracaoGrupo && reserva.declaracaoGrupo.qtdCriancas > 0 && <p>• {reserva.declaracaoGrupo.qtdCriancas} criança(s).</p>}
          {reserva.declaracaoGrupo?.possuiPcd && (
            <>
              <p>• {reserva.declaracaoGrupo.qtdPcd} PCD.</p>
              <p>• OBS: {reserva.declaracaoGrupo.descricaoDeficiencias || "N/A"}</p>
            </>
          )}
          <p className="mt-2 italic font-bold">Priorizar beliches inferiores. Prédio sem elevador.</p>
        </div>
      )}
    </div>
  );
}
