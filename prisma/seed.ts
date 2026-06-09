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
  const roomsData = [
    { nome: 'Quarto 101', tipo: QuartoTipo.TIPO_4_LEITOS, banheiroPrivativo: true, genero: QuartoGenero.MISTO },
    { nome: 'Quarto 102', tipo: QuartoTipo.TIPO_8_LEITOS, banheiroPrivativo: false, genero: QuartoGenero.MASCULINO },
    { nome: 'Quarto 103', tipo: QuartoTipo.TIPO_12_LEITOS, banheiroPrivativo: true, genero: QuartoGenero.FEMININO },
  ];

  for (const roomData of roomsData) {
    let room = await prisma.quarto.findFirst({
      where: { nome: roomData.nome }
    });

    if (room) {
      room = await prisma.quarto.update({
        where: { id: room.id },
        data: roomData
      });
    } else {
      room = await prisma.quarto.create({
        data: roomData
      });
    }
    console.log(`Room seeded/updated: ${room.nome} (${room.tipo})`);

    // 3. Seed Beds (Leitos)
    let numBeds = 0;
    if (room.tipo === QuartoTipo.TIPO_4_LEITOS) numBeds = 4;
    else if (room.tipo === QuartoTipo.TIPO_8_LEITOS) numBeds = 8;
    else if (room.tipo === QuartoTipo.TIPO_12_LEITOS) numBeds = 12;

    for (let i = 1; i <= numBeds; i++) {
      const leitoCodigo = `${room.nome.replace(' ', '')}-L${i.toString().padStart(2, '0')}`;
      await prisma.leito.upsert({
        where: { codigo: leitoCodigo },
        update: {
          quartoId: room.id,
          posicao: i % 2 === 0 ? LeitoPosicao.BELICHE_SUPERIOR : LeitoPosicao.BELICHE_INFERIOR,
          localizacao: i % 3 === 0 ? LeitoLocalizacao.PERTO_DA_JANELA : (i % 3 === 1 ? LeitoLocalizacao.PERTO_DA_PORTA : LeitoLocalizacao.CENTRAL),
          incidenciaSol: i % 3 === 0 ? LeitoIncidenciaSol.SOL_MANHA : (i % 3 === 1 ? LeitoIncidenciaSol.SOL_TARDE : LeitoIncidenciaSol.SEM_SOL),
        },
        create: {
          codigo: leitoCodigo,
          quartoId: room.id,
          posicao: i % 2 === 0 ? LeitoPosicao.BELICHE_SUPERIOR : LeitoPosicao.BELICHE_INFERIOR,
          localizacao: i % 3 === 0 ? LeitoLocalizacao.PERTO_DA_JANELA : (i % 3 === 1 ? LeitoLocalizacao.PERTO_DA_PORTA : LeitoLocalizacao.CENTRAL),
          incidenciaSol: i % 3 === 0 ? LeitoIncidenciaSol.SOL_MANHA : (i % 3 === 1 ? LeitoIncidenciaSol.SOL_TARDE : LeitoIncidenciaSol.SEM_SOL),
        },
      });
    }
    console.log(`  ${numBeds} beds seeded/updated for ${room.nome}`);
  }

  // 4. Seed Tariffs (Tarifas)
  const tariffs = [
    { quartoTipo: QuartoTipo.TIPO_4_LEITOS, valorDiaria: 150.00, tipo: TarifaTipo.PADRAO, criadoPorId: admin.id },
    { quartoTipo: QuartoTipo.TIPO_8_LEITOS, valorDiaria: 80.00, tipo: TarifaTipo.PADRAO, criadoPorId: admin.id },
    { quartoTipo: QuartoTipo.TIPO_12_LEITOS, valorDiaria: 120.00, tipo: TarifaTipo.PADRAO, criadoPorId: admin.id },
  ];

  for (const tariffData of tariffs) {
    const existingTariff = await prisma.tarifa.findFirst({
      where: { quartoTipo: tariffData.quartoTipo, tipo: tariffData.tipo }
    });

    if (existingTariff) {
      await prisma.tarifa.update({
        where: { id: existingTariff.id },
        data: tariffData
      });
    } else {
      await prisma.tarifa.create({
        data: tariffData
      });
    }
    console.log(`Tariff seeded/updated for ${tariffData.quartoTipo}: R$ ${tariffData.valorDiaria.toFixed(2)}`);
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
