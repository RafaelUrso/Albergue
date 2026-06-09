"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { forgotPassword } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const result = await forgotPassword(email);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Se um usuário com este e-mail existir, um link de recuperação foi enviado.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">{t("forgotPassword")}</h1>
      {message && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t("loading") : "Enviar link"}
        </button>
      </form>
    </div>
  );
}
