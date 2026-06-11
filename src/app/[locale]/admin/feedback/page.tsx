import { getFeedbacks, moderateFeedback } from "@/lib/actions/admin/feedback";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { FeedbackStatus } from "@prisma/client";
import Link from "next/link";

export default async function FeedbackAdminPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ status?: string }>
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  const session = await auth();
  if (!session || (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL') {
    redirect(`/${locale}/admin/dashboard`);
  }

  const feedbacks = await getFeedbacks(status as FeedbackStatus);
  const t = await getTranslations('Admin.feedback');

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href={`/${locale}/admin/dashboard`} className="text-azul-principal hover:underline font-bold text-sm uppercase">
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <Link href={`/${locale}/admin/feedback`} className={`px-4 py-2 rounded-full font-bold text-sm border ${!status ? 'bg-azul-principal text-white border-azul-principal' : 'bg-white text-gray-600 border-gray-200'}`}>
          {t('pending')}
        </Link>
        <Link href={`/${locale}/admin/feedback?status=APROVADO`} className={`px-4 py-2 rounded-full font-bold text-sm border ${status === 'APROVADO' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>
          {t('approved')}
        </Link>
        <Link href={`/${locale}/admin/feedback?status=REJEITADO`} className={`px-4 py-2 rounded-full font-bold text-sm border ${status === 'REJEITADO' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}>
          {t('rejected')}
        </Link>
      </div>

      <div className="space-y-6">
        {feedbacks.length === 0 && <p className="text-gray-500 text-center py-12 italic">Nenhum feedback encontrado nesta categoria.</p>}
        {feedbacks.map(f => (
          <div key={f.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold">{f.usuario.nomeCompleto}</p>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < f.nota ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="text-gray-700 mb-6 italic">&quot;{f.comentario}&quot;</p>

            {f.status === 'PENDENTE' && (
              <div className="flex gap-4">
                <form action={async () => {
                  'use server';
                  await moderateFeedback(f.id, FeedbackStatus.APROVADO);
                }}>
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold text-sm hover:bg-green-700 transition">
                    {t('approve')}
                  </button>
                </form>
                <form action={async () => {
                  'use server';
                  await moderateFeedback(f.id, FeedbackStatus.REJEITADO);
                }}>
                  <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded font-bold text-sm hover:bg-red-700 transition">
                    {t('reject')}
                  </button>
                </form>
              </div>
            )}

            {f.status !== 'PENDENTE' && (
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className={`text-xs font-bold uppercase ${f.status === 'APROVADO' ? 'text-green-600' : 'text-red-600'}`}>
                  {f.status}
                </span>
                {f.moderador && (
                  <span className="text-[10px] text-gray-400 italic">Moderado por: {f.moderador.nomeCompleto}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
