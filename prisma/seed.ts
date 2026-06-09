import { PrismaClient, Perfil, QuartoTipo, QuartoGenero, LeitoPosicao, LeitoLocalizacao, LeitoIncidenciaSol, LeitoStatus, TarifaTipo } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Criar Usuário Administrador Geral
  const adminEmail = 'admin@albergue.com.br';
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      senhaHash: hashedPassword,
    },
    create: {
      nomeCompleto: 'Administrador Geral',
      email: adminEmail,
      senhaHash: hashedPassword,
      telefone: '+5521999999999',
      nacionalidade: 'Brasileira',
      dataNascimento: new Date('1980-01-01'),
      documentoIdentificacao: '123456789',
      perfil: Perfil.ADMIN_GERAL,
      ativo: true,
    },
  });

  console.log('Admin user upserted');

  // 2. Definir Quartos e Leitos
  const quartosData = [
    {
      id: '00000000-0000-0000-0000-00000000000a',
      nome: 'Quarto A - Executivo',
      tipo: QuartoTipo.TIPO_4_LEITOS,
      banheiroPrivativo: true,
      genero: QuartoGenero.MISTO,
      leitosCount: 4,
      valorDiaria: 150.00,
    },
    {
      id: '00000000-0000-0000-0000-00000000000b',
      nome: 'Quarto B - Econômico',
      tipo: QuartoTipo.TIPO_8_LEITOS,
      banheiroPrivativo: false,
      genero: QuartoGenero.MASCULINO,
      leitosCount: 8,
      valorDiaria: 80.00,
    },
    {
      id: '00000000-0000-0000-0000-00000000000c',
      nome: 'Quarto C - Familiar',
      tipo: QuartoTipo.TIPO_12_LEITOS,
      banheiroPrivativo: true,
      genero: QuartoGenero.FEMININO,
      leitosCount: 12,
      valorDiaria: 120.00,
    },
  ];

  for (const q of quartosData) {
    const quarto = await prisma.quarto.upsert({
      where: { id: q.id },
      update: {
        nome: q.nome,
        tipo: q.tipo,
        banheiroPrivativo: q.banheiroPrivativo,
        genero: q.genero,
      },
      create: {
        id: q.id,
        nome: q.nome,
        tipo: q.tipo,
        banheiroPrivativo: q.banheiroPrivativo,
        genero: q.genero,
      },
    });

    console.log(`Quarto ${q.nome} upserted`);

    // Criar leitos para este quarto
    for (let i = 1; i <= q.leitosCount; i++) {
      const codigoLeito = `${q.nome.split(' ')[1]}-${i}`; // Ex: A-1, B-1, etc.

      // Atributos variados para os leitos
      let posicao: LeitoPosicao = LeitoPosicao.BELICHE_INFERIOR;
      if (i % 3 === 0) posicao = LeitoPosicao.CAMA_SIMPLES;
      else if (i % 2 === 0) posicao = LeitoPosicao.BELICHE_SUPERIOR;

      let localizacao: LeitoLocalizacao = LeitoLocalizacao.CENTRAL;
      if (i === 1) localizacao = LeitoLocalizacao.PERTO_DA_PORTA;
      else if (i === q.leitosCount) localizacao = LeitoLocalizacao.PERTO_DA_JANELA;

      let incidenciaSol: LeitoIncidenciaSol = LeitoIncidenciaSol.SEM_SOL;
      if (i % 2 === 0) incidenciaSol = LeitoIncidenciaSol.SOL_MANHA;
      else if (i % 3 === 0) incidenciaSol = LeitoIncidenciaSol.SOL_TARDE;

      await prisma.leito.upsert({
        where: { codigo: codigoLeito },
        update: {
          quartoId: quarto.id,
          posicao,
          localizacao,
          incidenciaSol,
          status: LeitoStatus.DISPONIVEL,
        },
        create: {
          quartoId: quarto.id,
          codigo: codigoLeito,
          posicao,
          localizacao,
          incidenciaSol,
          status: LeitoStatus.DISPONIVEL,
        },
      });
    }
    console.log(`Leitos for ${q.nome} upserted`);

    // 3. Criar Tarifas
    const tarifaId = Buffer.from(`tarifa-${q.tipo}`).toString('hex').padEnd(32, '0').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    await prisma.tarifa.upsert({
      where: { id: tarifaId },
      update: {
        valorDiaria: q.valorDiaria,
        tipo: TarifaTipo.PADRAO,
        criadoPorId: admin.id,
      },
      create: {
        id: tarifaId,
        quartoTipo: q.tipo,
        valorDiaria: q.valorDiaria,
        tipo: TarifaTipo.PADRAO,
        criadoPorId: admin.id,
      },
    });
    console.log(`Tarifa for ${q.tipo} upserted`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
