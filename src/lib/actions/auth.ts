"use server";

import { prisma } from "@/lib/prisma";
import { RegisterInput } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/crypto";
import { Perfil } from "@prisma/client";

export async function registerUser(data: RegisterInput) {
  const {
    nomeCompleto,
    email,
    password,
    telefone,
    nacionalidade,
    dataNascimento,
    documentoIdentificacao,
    passaporte,
  } = data;

  try {
    const userExists = await prisma.usuario.findUnique({
      where: { email },
    });

    if (userExists) {
      return { error: "Este e-mail já está em uso." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let encryptedPassport = null;
    if (nacionalidade !== "Brasileira" && passaporte) {
      encryptedPassport = encrypt(passaporte);
    }

    // TERMO_VERSAO: Hardcoded for now as requested for the immutable record
    const TERMO_VERSAO = "1.0.0";

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.usuario.create({
        data: {
          nomeCompleto,
          email,
          senhaHash: hashedPassword,
          telefone,
          nacionalidade,
          dataNascimento: new Date(dataNascimento),
          documentoIdentificacao,
          passaporteCriptografado: encryptedPassport,
          perfil: Perfil.HOSPEDE,
          aceiteTermosAt: new Date(),
        },
      });

      await tx.aceiteTermos.create({
        data: {
          usuarioId: newUser.id,
          versaoTermo: TERMO_VERSAO,
          aceitoEm: new Date(),
        },
      });

      // Audit Log for user creation
      await tx.auditLog.create({
        data: {
          usuarioId: newUser.id,
          acao: "USER_REGISTER",
          entidade: "Usuario",
          entidadeId: newUser.id,
          dadosNovos: {
            email: newUser.email,
            perfil: newUser.perfil,
          },
        },
      });

      return newUser;
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Erro ao criar conta. Tente novamente mais tarde." };
  }
}

export async function forgotPassword(email: string) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      return { success: true };
    }

    // In a real app, send email. Here we mock it.
    const token = Math.random().toString(36).substring(2, 15);
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}&email=${email}`;

    console.log(`[MOCK EMAIL] To: ${email} - Link: ${resetLink}`);

    return { success: true };
  } catch (error) {
    return { error: "Erro ao processar solicitação." };
  }
}

export async function resetPassword(email: string, token: string, newPassword: string) {
    // SECURITY: In a real app, we would verify the token against a record in the DB
    // For Phase 2 mock, we check if token is present and not empty
    if (!token || token.length < 5) {
      return { error: "Token de recuperação inválido ou expirado." };
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.usuario.update({
            where: { email },
            data: { senhaHash: hashedPassword }
        });
        return { success: true };
    } catch (error) {
        return { error: "Erro ao resetar senha." };
    }
}
