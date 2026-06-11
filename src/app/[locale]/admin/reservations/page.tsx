import { getFilteredReservations, updateReservationStatus } from "@/lib/actions/admin/reservations";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ReservaStatus } from "@prisma/client";
import Link from "next/link";

export default async function ReservationsAdminPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ status?: string, guestName?: string, startDate?: string, endDate?: string, room?: string }>
}) {
  const { locale } = await params;
  const { status, guestName, startDate, endDate, room } = await searchParams;
  const session = await auth();
  const perfil = (session?.user as { perfil?: string })?.perfil;

  if (!session || !['ADMIN_GERAL', 'ADMIN_FINANCEIRO'].includes(perfil || '')) {
    redirect(`/${locale}/auth/login`);
  }

  const reservations = await getFilteredReservations({
    status: status as ReservaStatus,
    guestName,
    startDate,
    endDate,
    room
  });

  const t = await getTranslations('Admin.reservations');

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href={`/${locale}/admin/dashboard`} className="text-azul-principal hover:underline font-bold text-sm uppercase">
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">{t('status')}</label>
            <select name="status" defaultValue={status} className="w-full p-2 border rounded">
              <option value="">{t('status')}</option>
              {Object.values(ReservaStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">{t('guest')}</label>
            <input type="text" name="guestName" defaultValue={guestName} className="w-full p-2 border rounded" placeholder="Nome do hóspede" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Início</label>
            <input type="date" name="startDate" defaultValue={startDate} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Fim</label>
            <input type="date" name="endDate" defaultValue={endDate} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">{t('room')}</label>
            <input type="text" name="room" defaultValue={room} className="w-full p-2 border rounded" placeholder="Nome do quarto" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-azul-principal text-white px-6 py-2 rounded font-bold hover:opacity-90">
              {t('filter')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">ID</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('guest')}</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('period')}</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('status')}</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">Valor Total</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reservations.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-500">{r.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold">{r.usuarioTitular.nomeCompleto}</p>
                  <p className="text-xs text-gray-500">{r.usuarioTitular.email}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                  {r.dataCheckin.toLocaleDateString()} - {r.dataCheckout.toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                    r.status === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' :
                    r.status === 'CHECKIN' ? 'bg-green-100 text-green-800' :
                    r.status === 'CHECKOUT' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold">
                  R$ {r.valorTotal.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                   <form action={async (formData: FormData) => {
                     'use server';
                     const newStatus = formData.get('newStatus') as ReservaStatus;
                     await updateReservationStatus(r.id, newStatus);
                   }} className="flex gap-2">
                     <select name="newStatus" className="text-xs p-1 border rounded" defaultValue={r.status}>
                        {Object.values(ReservaStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                     </select>
                     <button type="submit" className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded font-bold transition">
                       OK
                     </button>
                   </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservations.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-bold">
            Nenhuma reserva encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
