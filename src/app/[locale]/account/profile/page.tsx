'use client';

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { updateUserProfile } from "@/lib/actions/user";
import { getUserProfile } from "@/lib/actions/user-fetch";

export default function ProfilePage() {
  const t = useTranslations("Account.profile");
  const tAuth = useTranslations("Auth");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    nacionalidade: '',
    dataNascimento: '',
    documentoIdentificacao: '',
  });

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile) {
        setFormData({
          nomeCompleto: profile.nomeCompleto || '',
          email: profile.email || '',
          telefone: profile.telefone || '',
          nacionalidade: profile.nacionalidade || '',
          dataNascimento: profile.dataNascimento ? new Date(profile.dataNascimento).toISOString().split('T')[0] : '',
          documentoIdentificacao: profile.documentoIdentificacao || '',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateUserProfile({
        nomeCompleto: formData.nomeCompleto,
        telefone: formData.telefone,
        nacionalidade: formData.nacionalidade,
        dataNascimento: new Date(formData.dataNascimento),
        documentoIdentificacao: formData.documentoIdentificacao,
      });
      setMessage({ type: 'success', text: t("success") });
    } catch (_error) {
      setMessage({ type: 'error', text: t("error") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mx-auto p-8">{tAuth("loading")}</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl py-12">
      <h1 className="text-3xl font-bold text-azul-principal mb-8">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
        {message && (
          <div className={`p-4 rounded-lg font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">{tAuth("fullName")}</label>
          <input
            type="text"
            value={formData.nomeCompleto}
            onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">E-mail</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">{tAuth("phone")}</label>
            <input
              type="text"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">{tAuth("nationality")}</label>
            <input
              type="text"
              value={formData.nacionalidade}
              onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">{tAuth("birthDate")}</label>
            <input
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">{tAuth("document")}</label>
            <input
              type="text"
              value={formData.documentoIdentificacao}
              onChange={(e) => setFormData({ ...formData, documentoIdentificacao: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-azul-principal text-white font-bold py-4 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}
