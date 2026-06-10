"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/lib/actions/auth";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { locale } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nationality, setNationality] = useState("Brasileira");
  const [showPassword, setShowPassword] = useState(false);

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
        router.push(`/${locale}/auth/login`);
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
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium">{t("password")}</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full border p-2 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-7 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
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
