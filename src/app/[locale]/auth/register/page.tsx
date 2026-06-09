"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/lib/actions/auth";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nationality, setNationality] = useState("Brasileira");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Convert checkbox to boolean for Zod
    const payload = {
      ...data,
      aceiteTermos: data.aceiteTermos === "on",
    };

    const result = registerSchema.safeParse(payload);

    if (!result.success) {
      setError(result.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(result.data);
      if (response.error) {
        setError(response.error);
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">{t("registerTitle")}</h1>
      {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nomeCompleto" className="block text-sm font-medium">{t("fullName")}</label>
          <input id="nomeCompleto" name="nomeCompleto" type="text" required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">{t("password")}</label>
          <input id="password" name="password" type="password" required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium">{t("phone")}</label>
          <input id="telefone" name="telefone" type="text" required className="w-full border p-2 rounded" placeholder="+55..." />
        </div>
        <div>
          <label htmlFor="nacionalidade" className="block text-sm font-medium">{t("nationality")}</label>
          <select
            id="nacionalidade"
            name="nacionalidade"
            className="w-full border p-2 rounded"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          >
            <option value="Brasileira">Brasileira</option>
            <option value="Americana">Americana</option>
            <option value="Argentina">Argentina</option>
            <option value="Outra">Outra</option>
          </select>
        </div>
        <div>
          <label htmlFor="dataNascimento" className="block text-sm font-medium">{t("birthDate")}</label>
          <input id="dataNascimento" name="dataNascimento" type="date" required className="w-full border p-2 rounded" />
        </div>

        {nationality === "Brasileira" ? (
          <div>
            <label htmlFor="documentoIdentificacao" className="block text-sm font-medium">CPF</label>
            <input id="documentoIdentificacao" name="documentoIdentificacao" type="text" required className="w-full border p-2 rounded" />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="documentoIdentificacao" className="block text-sm font-medium">{t("document")}</label>
              <input id="documentoIdentificacao" name="documentoIdentificacao" type="text" required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label htmlFor="passaporte" className="block text-sm font-medium">{t("passport")}</label>
              <input id="passaporte" name="passaporte" type="text" required className="w-full border p-2 rounded" placeholder="Registro de passagem pelo RJ" />
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <input type="checkbox" name="aceiteTermos" id="terms" required />
          <label htmlFor="terms" className="text-sm">
            {t("termsAccept")} <a href="#" className="text-blue-600 underline">{t("termsLink")}</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t("loading") : t("registerButton")}
        </button>
      </form>
    </div>
  );
}
