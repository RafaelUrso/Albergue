'use client';

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ContactPage() {
  const t = useTranslations("ContactPage");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend for this form yet, just simulate success
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-bold text-azul-principal mb-4">{t("title")}</h1>
      <p className="text-gray-600 mb-12">{t("description")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form & Group Info */}
        <div className="space-y-12">
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("negotiation.title")}</h2>
            <p className="text-gray-600 leading-relaxed mb-6">{t("negotiation.content")}</p>

            {submitted ? (
              <div className="bg-green-100 text-green-700 p-4 rounded-lg font-bold">
                {t("form.success")}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder={t("form.name")} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none" />
                  <input type="email" placeholder={t("form.email")} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none" />
                </div>
                <input type="text" placeholder={t("form.subject")} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none" />
                <textarea placeholder={t("form.message")} rows={5} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-azul-principal outline-none"></textarea>
                <button type="submit" className="w-full md:w-auto bg-azul-principal text-white font-bold px-8 py-3 rounded-lg hover:bg-opacity-90 transition">
                  {t("form.send")}
                </button>
              </form>
            )}
          </section>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <section className="bg-azul-principal text-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{t("info.title")}</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-bold">{t("info.address")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="font-bold">{t("info.phone")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">✉️</span>
                <div>
                  <p className="font-bold">{t("info.email")}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="h-64 bg-gray-200 rounded-xl overflow-hidden relative grayscale hover:grayscale-0 transition duration-500">
             {/* Map Placeholder */}
             <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">
                MAPA INTERATIVO (GOOGLE MAPS API)
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
