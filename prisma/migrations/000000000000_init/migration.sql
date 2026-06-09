-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN_GERAL', 'ADMIN_FINANCEIRO', 'RECEPCIONISTA', 'HOSPEDE');

-- CreateEnum
CREATE TYPE "QuartoTipo" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "QuartoGenero" AS ENUM ('MASCULINO', 'FEMININO', 'MISTO');

-- CreateEnum
CREATE TYPE "LeitoPosicao" AS ENUM ('BELICHE_SUPERIOR', 'BELICHE_INFERIOR', 'CAMA_SIMPLES');

-- CreateEnum
CREATE TYPE "LeitoLocalizacao" AS ENUM ('PERTO_DA_PORTA', 'PERTO_DA_JANELA', 'CENTRAL');

-- CreateEnum
CREATE TYPE "LeitoIncidenciaSol" AS ENUM ('SOL_MANHA', 'SOL_TARDE', 'SEM_SOL');

-- CreateEnum
CREATE TYPE "LeitoStatus" AS ENUM ('DISPONIVEL', 'INDISPONIVEL', 'EM_MANUTENCAO');

-- CreateEnum
CREATE TYPE "ReservaStatus" AS ENUM ('CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TarifaTipo" AS ENUM ('PADRAO', 'SAZONAL', 'PROMOCIONAL');

-- CreateEnum
CREATE TYPE "PagamentoMetodo" AS ENUM ('CARTAO_CREDITO');

-- CreateEnum
CREATE TYPE "PagamentoStatus" AS ENUM ('PENDENTE', 'CONCLUIDO', 'FALHADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "nacionalidade" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "documentoIdentificacao" TEXT NOT NULL,
    "passaporteCriptografado" TEXT,
    "perfil" "Perfil" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "aceiteTermosAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quarto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "QuartoTipo" NOT NULL,
    "banheiroPrivativo" BOOLEAN NOT NULL,
    "genero" "QuartoGenero" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quarto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leito" (
    "id" TEXT NOT NULL,
    "quartoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "posicao" "LeitoPosicao" NOT NULL,
    "localizacao" "LeitoLocalizacao" NOT NULL,
    "incidenciaSol" "LeitoIncidenciaSol" NOT NULL,
    "status" "LeitoStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "usuarioTitularId" TEXT NOT NULL,
    "status" "ReservaStatus" NOT NULL DEFAULT 'CONFIRMADA',
    "dataCheckin" TIMESTAMP(3) NOT NULL,
    "dataCheckout" TIMESTAMP(3) NOT NULL,
    "valorTotal" DECIMAL(65,30) NOT NULL,
    "valorPago" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaLeito" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "leitoId" TEXT NOT NULL,
    "hospedeOcupanteId" TEXT,

    CONSTRAINT "ReservaLeito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospedeAvulso" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "documento" TEXT NOT NULL,

    CONSTRAINT "HospedeAvulso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeclaracaoGrupo" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "qtdAdultos" INTEGER NOT NULL,
    "qtdCriancas" INTEGER NOT NULL DEFAULT 0,
    "possuiPcd" BOOLEAN NOT NULL DEFAULT false,
    "qtdPcd" INTEGER NOT NULL DEFAULT 0,
    "descricaoDeficiencias" TEXT,

    CONSTRAINT "DeclaracaoGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarifa" (
    "id" TEXT NOT NULL,
    "quartoTipo" "QuartoTipo" NOT NULL,
    "valorDiaria" DECIMAL(65,30) NOT NULL,
    "tipo" "TarifaTipo" NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tarifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "gatewayTransactionId" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" "PagamentoStatus" NOT NULL,
    "metodo" "PagamentoMetodo" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cancelamento" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "solicitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorEstornado" DECIMAL(65,30) NOT NULL,
    "taxaRetida" DECIMAL(65,30) NOT NULL,
    "politicaAplicada" TEXT NOT NULL,
    "confirmadoPorUsuario" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cancelamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDENTE',
    "moderadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "dadosAnteriores" JSONB,
    "dadosNovos" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AceiteTermos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "versaoTermo" TEXT NOT NULL,
    "aceitoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AceiteTermos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Leito_codigo_key" ON "Leito"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "DeclaracaoGrupo_reservaId_key" ON "DeclaracaoGrupo"("reservaId");

-- CreateIndex
CREATE UNIQUE INDEX "Cancelamento_reservaId_key" ON "Cancelamento"("reservaId");

-- AddForeignKey
ALTER TABLE "Leito" ADD CONSTRAINT "Leito_quartoId_fkey" FOREIGN KEY ("quartoId") REFERENCES "Quarto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_usuarioTitularId_fkey" FOREIGN KEY ("usuarioTitularId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaLeito" ADD CONSTRAINT "ReservaLeito_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaLeito" ADD CONSTRAINT "ReservaLeito_leitoId_fkey" FOREIGN KEY ("leitoId") REFERENCES "Leito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaLeito" ADD CONSTRAINT "ReservaLeito_hospedeOcupanteId_fkey" FOREIGN KEY ("hospedeOcupanteId") REFERENCES "HospedeAvulso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclaracaoGrupo" ADD CONSTRAINT "DeclaracaoGrupo_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarifa" ADD CONSTRAINT "Tarifa_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancelamento" ADD CONSTRAINT "Cancelamento_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_moderadoPorId_fkey" FOREIGN KEY ("moderadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AceiteTermos" ADD CONSTRAINT "AceiteTermos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
