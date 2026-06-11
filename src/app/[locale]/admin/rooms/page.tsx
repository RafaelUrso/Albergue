import { getRooms, createRoom, updateRoom } from "@/lib/actions/admin/rooms";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { QuartoTipo, QuartoGenero } from "@prisma/client";
import Link from "next/link";

export default async function RoomsAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    redirect(`/${locale}/admin/dashboard`);
  }

  const rooms = await getRooms();
  const t = await getTranslations('Admin.rooms');

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href={`/${locale}/admin/dashboard`} className="text-azul-principal hover:underline font-bold text-sm uppercase">
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">{t('add')}</h2>
        <form action={async (formData: FormData) => {
          'use server';
          await createRoom({
            nome: formData.get('nome') as string,
            tipo: formData.get('tipo') as QuartoTipo,
            banheiroPrivativo: formData.get('banheiroPrivativo') === 'true',
            genero: formData.get('genero') as QuartoGenero,
          });
        }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" name="nome" placeholder={t('name')} required className="p-2 border rounded" />
          <select name="tipo" required className="p-2 border rounded">
            {Object.values(QuartoTipo).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select name="genero" required className="p-2 border rounded">
            {Object.values(QuartoGenero).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select name="banheiroPrivativo" className="p-2 border rounded">
            <option value="true">Banheiro Privativo</option>
            <option value="false">Banheiro Corredor</option>
          </select>
          <button type="submit" className="bg-azul-principal text-white px-4 py-2 rounded font-bold hover:opacity-90">
            {t('add')}
          </button>
        </form>
      </div>

      <div className="grid gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{room.nome}</h3>
              <p className="text-sm text-gray-500">
                {room.tipo} | {room.genero} | {room.banheiroPrivativo ? 'Privativo' : 'Compartilhado'}
              </p>
              <p className="text-sm font-bold mt-2 text-azul-principal">{room._count.leitos} Leitos</p>
            </div>
            <div className="flex gap-2">
               <form action={async () => {
                 'use server';
                 await updateRoom(room.id, { ativo: !room.ativo });
               }}>
                 <button type="submit" className={`px-4 py-2 rounded text-xs font-bold ${room.ativo ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                   {room.ativo ? 'Desativar' : 'Ativar'}
                 </button>
               </form>
               <Link href={`/${locale}/admin/rooms/${room.id}`} className="bg-azul-principal text-white px-4 py-2 rounded text-xs font-bold hover:opacity-90">
                 {t('manageBeds')}
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
