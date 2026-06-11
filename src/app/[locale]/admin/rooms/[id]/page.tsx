import { getBeds, createBed, updateBed } from "@/lib/actions/admin/rooms";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol, LeitoStatus } from "@prisma/client";
import Link from "next/link";

export default async function BedAdminPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id: roomId } = await params;
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    redirect(`/${locale}/admin/dashboard`);
  }

  const room = await prisma.quarto.findUnique({ where: { id: roomId } });
  if (!room) redirect(`/${locale}/admin/rooms`);

  const beds = await getBeds(roomId);
  const t = await getTranslations('Admin.beds');

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href={`/${locale}/admin/rooms`} className="text-azul-principal hover:underline text-sm uppercase font-bold mb-2 block">
            ← Voltar para Quartos
          </Link>
          <h1 className="text-3xl font-bold">{t('title', { room: room.nome })}</h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">{t('add')}</h2>
        <form action={async (formData: FormData) => {
          'use server';
          await createBed({
            quartoId: roomId,
            codigo: formData.get('codigo') as string,
            posicao: formData.get('posicao') as LeitoPosicao,
            localizacao: formData.get('localizacao') as LeitoLocalizacao,
            incidenciaSol: formData.get('incidenciaSol') as LeitoIncidenciaSol,
            status: formData.get('status') as LeitoStatus,
          });
        }} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input type="text" name="codigo" placeholder={t('code')} required className="p-2 border rounded" />
          <select name="posicao" className="p-2 border rounded">
            {Object.values(LeitoPosicao).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select name="localizacao" className="p-2 border rounded">
            {Object.values(LeitoLocalizacao).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select name="incidenciaSol" className="p-2 border rounded">
            {Object.values(LeitoIncidenciaSol).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select name="status" className="p-2 border rounded">
            {Object.values(LeitoStatus).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <button type="submit" className="bg-azul-principal text-white px-4 py-2 rounded font-bold hover:opacity-90">
            {t('add')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('code')}</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('position')}</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('location')}</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('sun')}</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">{t('status')}</th>
              <th className="px-6 py-3 text-xs font-black uppercase text-gray-500 tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {beds.map(bed => (
              <tr key={bed.id}>
                <td className="px-6 py-4 font-bold">{bed.codigo}</td>
                <td className="px-6 py-4 text-sm">{bed.posicao}</td>
                <td className="px-6 py-4 text-sm">{bed.localizacao}</td>
                <td className="px-6 py-4 text-sm">{bed.incidenciaSol}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                    bed.status === 'DISPONIVEL' ? 'bg-green-100 text-green-800' :
                    bed.status === 'INDISPONIVEL' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bed.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <form action={async (formData: FormData) => {
                    'use server';
                    const newStatus = formData.get('status') as LeitoStatus;
                    await updateBed(bed.id, roomId, { status: newStatus });
                  }} className="flex gap-2">
                     <select name="status" defaultValue={bed.status} className="text-xs p-1 border rounded">
                        {Object.values(LeitoStatus).map(v => <option key={v} value={v}>{v}</option>)}
                     </select>
                     <button type="submit" className="text-xs bg-gray-200 px-2 py-1 rounded font-bold">OK</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
