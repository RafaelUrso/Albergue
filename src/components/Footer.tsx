'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Footer() {
  const t = useTranslations('TopBar'); // Reusing TopBar for hostelName if needed, or define a new Footer namespace
  const tLinks = useTranslations();
  const { locale } = useParams();

  const currentLocale = (locale as string) || 'pt-BR';

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-azul-principal">Sr. Almeida</h3>
          <p className="text-gray-400 text-sm">
            Seu porto seguro em Santa Teresa, Rio de Janeiro. Conforto, comunidade e cultura em um só lugar.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Navegação</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href={`/${currentLocale}/rooms`} className="hover:text-azul-principal transition">Quartos e Leitos</Link></li>
            <li><Link href={`/${currentLocale}/map`} className="hover:text-azul-principal transition">Mapa do Albergue</Link></li>
            <li><Link href={`/${currentLocale}/amenities`} className="hover:text-azul-principal transition">Comodidades</Link></li>
            <li><Link href={`/${currentLocale}/feedback`} className="hover:text-azul-principal transition">Avaliações</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Informações</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href={`/${currentLocale}/rules`} className="hover:text-azul-principal transition">Regras do Albergue</Link></li>
            <li><Link href={`/${currentLocale}/contact`} className="hover:text-azul-principal transition">Contato / Grupos</Link></li>
            <li><Link href={`/${currentLocale}/auth/register`} className="hover:text-azul-principal transition">Cadastre-se</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Siga-nos</h4>
          <div className="flex gap-4">
             {/* Social placeholders */}
             <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-azul-principal transition cursor-pointer">IG</div>
             <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-azul-principal transition cursor-pointer">FB</div>
             <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-azul-principal transition cursor-pointer">TW</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
        <p>&copy; 2026 Albergue Sr. Almeida. Todos os direitos reservados. Desenvolvido por XPTOTec.</p>
      </div>
    </footer>
  );
}
