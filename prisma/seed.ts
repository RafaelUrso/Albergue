import { PrismaClient, Perfil, QuartoTipo, QuartoGenero, LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol, TarifaTipo } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Seed Admin Geral User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@albergue.com' },
    update: {},
    create: {
      nomeCompleto: 'Administrador Geral',
      email: 'admin@albergue.com',
      senhaHash: adminPassword,
      telefone: '+5521999999999',
      nacionalidade: 'Brasileira',
      dataNascimento: new Date('1980-01-01'),
      documentoIdentificacao: '12345678900',
      perfil: Perfil.ADMIN_GERAL,
      ativo: true,
    },
  });

  console.log('Admin user seeded:', admin.email);

  // 2. Seed Rooms (Quartos)
  const rooms = [
    { nome: 'Quarto 101', tipo: QuartoTipo.A, banheiroPrivativo: true, genero: QuartoGenero.MISTO },
    { nome: 'Quarto 102', tipo: QuartoTipo.B, banheiroPrivativo: false, genero: QuartoGenero.MASCULINO },
    { nome: 'Quarto 103', tipo: QuartoTipo.C, banheiroPrivativo: true, genero: QuartoGenero.FEMININO },
  ];

  for (const roomData of rooms) {
    const room = await prisma.quarto.create({
      data: roomData,
    });
    console.log(`Room seeded: ${room.nome} (${room.tipo})`);

    // 3. Seed Beds (Leitos)
    let numBeds = 0;
    if (room.tipo === QuartoTipo.A) numBeds = 4;
    else if (room.tipo === QuartoTipo.B) numBeds = 8;
    else if (room.tipo === QuartoTipo.C) numBeds = 12;

    for (let i = 1; i <= numBeds; i++) {
      await prisma.leito.create({
        data: {
          quartoId: room.id,
          codigo: `${room.nome.replace(' ', '')}-L${i.toString().padStart(2, '0')}`,
          posicao: i % 2 === 0 ? LeitoPosicao.BELICHE_SUPERIOR : LeitoPosicao.BELICHE_INFERIOR,
          localizacao: i % 3 === 0 ? LeitoLocalizacao.PERTO_DA_JANELA : (i % 3 === 1 ? LeitoLocalizacao.PERTO_DA_PORTA : LeitoLocalizacao.CENTRAL),
          incidenciaSol: i % 3 === 0 ? LeitoIncidenciaSol.SOL_MANHA : (i % 3 === 1 ? LeitoIncidenciaSol.SOL_TARDE : LeitoIncidenciaSol.SEM_SOL),
        },
      });
    }
    console.log(`  ${numBeds} beds seeded for ${room.nome}`);
  }

  // 4. Seed Tariffs (Tarifas)
  const tariffs = [
    { quartoTipo: QuartoTipo.A, valorDiaria: 150.00, tipo: TarifaTipo.PADRAO, criadoPorId: admin.id },
    { quartoTipo: QuartoTipo.B, valorDiaria: 80.00, tipo: TarifaTipo.PADRAO, criadoPorId: admin.id },
    { quartoTipo: QuartoTipo.C, valorDiaria: 120.00, tipo: TarifaTipo.PADRAO, criadoPorId: admin.id },
  ];

  for (const tariffData of tariffs) {
    await prisma.tarifa.create({
      data: tariffData,
    });
    console.log(`Tariff seeded for ${tariffData.quartoTipo}: R$ ${tariffData.valorDiaria.toFixed(2)}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
