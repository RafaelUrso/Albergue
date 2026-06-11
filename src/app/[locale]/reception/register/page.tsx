import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/actions/auth";

export default async function ReceptionRegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  const perfil = (session?.user as { perfil?: string })?.perfil;

  if (!session || !['ADMIN_GERAL', 'RECEPCIONISTA'].includes(perfil || '')) {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations('Auth');

  return (
    <div className="pt-24 pb-12 px-4 max-w-xl mx-auto">
      <div className="mb-8">
        <Link href={`/${locale}/reception`} className="text-azul-principal hover:underline text-sm uppercase font-bold mb-2 block">
          ← Voltar para Recepção
        </Link>
        <h1 className="text-3xl font-bold">Cadastro Presencial de Hóspede</h1>
        <p className="text-gray-500">Registre um novo hóspede que chegou ao albergue sem cadastro prévio.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <form action={async (formData: FormData) => {
          'use server';
          const data = {
            nomeCompleto: formData.get('nomeCompleto') as string,
            email: formData.get('email') as string,
            password: formData.get('senha') as string,
            telefone: formData.get('telefone') as string,
            nacionalidade: formData.get('nacionalidade') as string,
            dataNascimento: formData.get('dataNascimento') as string,
            documentoIdentificacao: formData.get('documentoIdentificacao') as string,
            aceiteTermos: true as const
          };
          await registerUser(data);
        }} className="space-y-4">
          <input type="hidden" name="perfil" value="HOSPEDE" />
          <input type="hidden" name="aceiteTermos" value="true" />

          <div>
            <label className="block text-sm font-bold mb-1">{t('fullName')}</label>
            <input name="nomeCompleto" type="text" required className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">E-mail</label>
            <input name="email" type="email" required className="w-full p-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">{t('password')}</label>
              <input name="senha" type="password" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">{t('phone')}</label>
              <input name="telefone" type="text" required className="w-full p-2 border rounded" placeholder="+55..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">{t('nationality')}</label>
              <select name="nacionalidade" required className="w-full p-2 border rounded">
                <option value="Brasileira">Brasileira</option>
                <option value="Americana">Americana</option>
                <option value="Argentina">Argentina</option>
                <option value="Portuguesa">Portuguesa</option>
                {/* etc... */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">{t('birthDate')}</label>
              <input name="dataNascimento" type="date" required className="w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">{t('document')} / {t('passport')}</label>
            <input name="documentoIdentificacao" type="text" required className="w-full p-2 border rounded" />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-azul-principal text-white py-3 rounded-lg font-black uppercase hover:opacity-90 transition shadow-md">
              Cadastrar Hóspede
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
