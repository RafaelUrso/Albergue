import { prisma } from "@/lib/prisma";

export default async function ReceptionPage() {
  const reservas = await prisma.reserva.findMany({
    where: {
      status: { in: ["CONFIRMADA", "CHECKIN"] },
    },
    include: {
      usuarioTitular: true,
      leitos: {
        include: {
          leito: {
            include: {
              quarto: true,
            },
          },
          hospedeOcupante: true,
        },
      },
      declaracaoGrupo: true,
    },
    orderBy: {
      dataCheckin: "asc",
    },
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Painel da Recepção</h1>

      <div className="grid gap-6">
        {reservas.length === 0 ? (
          <p>Nenhuma reserva confirmada ou ativa no momento.</p>
        ) : (
          reservas.map((reserva) => {
            const hasAlert = reserva.declaracaoGrupo?.qtdCriancas && reserva.declaracaoGrupo.qtdCriancas > 0 || reserva.declaracaoGrupo?.possuiPcd;

            return (
              <div
                key={reserva.id}
                className={`border p-4 rounded-lg shadow-sm ${hasAlert ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{reserva.usuarioTitular.nomeCompleto}</h2>
                    <p className="text-sm text-gray-600">ID Reserva: {reserva.id}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      reserva.status === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {reserva.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Check-in:</strong> {reserva.dataCheckin.toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> {reserva.dataCheckout.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p><strong>Leitos:</strong> {reserva.leitos.map(l => l.leito.codigo).join(", ")}</p>
                    <p><strong>Quartos:</strong> {Array.from(new Set(reserva.leitos.map(l => l.leito.quarto.nome))).join(", ")}</p>
                  </div>
                </div>

                {hasAlert && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-800">
                    <p className="font-bold">⚠️ ALERTA DE ATENDIMENTO ESPECIAL:</p>
                    {reserva.declaracaoGrupo?.qtdCriancas && reserva.declaracaoGrupo.qtdCriancas > 0 && (
                      <p>• {reserva.declaracaoGrupo.qtdCriancas} criança(s) no grupo.</p>
                    )}
                    {reserva.declaracaoGrupo?.possuiPcd && (
                      <>
                        <p>• {reserva.declaracaoGrupo.qtdPcd} pessoa(s) com deficiência.</p>
                        <p>• Descrição: {reserva.declaracaoGrupo.descricaoDeficiencias || "Não informada"}</p>
                      </>
                    )}
                    <p className="mt-2 text-xs italic">Priorizar beliches inferiores ou quartos acessíveis (Sem elevador no prédio).</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
