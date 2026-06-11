import { getPublicRooms } from "@/lib/actions/rooms";
import { useTranslations } from "next-intl";

interface RoomWithTariff {
  id: string;
  nome: string;
  tipo: 'TIPO_4_LEITOS' | 'TIPO_8_LEITOS' | 'TIPO_12_LEITOS';
  banheiroPrivativo: boolean;
  genero: 'MASCULINO' | 'FEMININO' | 'MISTO';
  valorDiaria: number;
  leitos: Array<{
    id: string;
    codigo: string;
    posicao: string;
    localizacao: string;
  }>;
}

export default async function RoomsPage() {
  const rooms = await getPublicRooms() as RoomWithTariff[];

  return <RoomsContent rooms={rooms} />;
}

function RoomsContent({ rooms }: { rooms: RoomWithTariff[] }) {
  const t = useTranslations("RoomsPage");
  const tEnum = useTranslations("Enums");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-azul-principal mb-4">{t("title")}</h1>
      <p className="text-gray-600 mb-12">{t("description")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{room.nome}</h2>
                <span className="bg-blue-100 text-azul-principal text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {room.tipo === 'TIPO_4_LEITOS' ? '4 Leitos' : room.tipo === 'TIPO_8_LEITOS' ? '8 Leitos' : '12 Leitos'}
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{t("capacity", { count: room.leitos.length })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{t("bathroom")}: {room.banheiroPrivativo ? t("private") : t("shared")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{t("gender")}: {tEnum(`QuartoGenero.${room.genero}`)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">{t("bedDetails")}:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {room.leitos.map((leito) => (
                    <div key={leito.id} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                      <span className="font-medium">{leito.codigo}</span>
                      <span className="text-gray-500">
                        {tEnum(`LeitoPosicao.${leito.posicao}`)} • {tEnum(`LeitoLocalizacao.${leito.localizacao}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">{t("tariff")}</p>
                <p className="text-2xl font-black text-azul-principal">
                  R$ {room.valorDiaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
