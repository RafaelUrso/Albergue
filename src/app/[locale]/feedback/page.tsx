'use client';

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { getApprovedFeedbacks } from "@/lib/actions/feedback";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface FeedbackWithUser {
  id: string;
  nota: number;
  comentario: string | null;
  createdAt: Date;
  usuario: {
    nomeCompleto: string;
  };
}

export default function FeedbackPage() {
  const t = useTranslations("FeedbackPage");
  const { data: session } = useSession();
  const { locale } = useParams();
  const [feedbacks, setFeedbacks] = useState<FeedbackWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedFeedbacks().then(data => {
      setFeedbacks(data as FeedbackWithUser[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold text-azul-principal mb-12 text-center">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Approved Feedbacks List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center text-gray-500">{t("noReviews")}</p>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-800">{fb.usuario.nomeCompleto}</span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < fb.nota ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic">&quot;{fb.comentario}&quot;</p>
                <p className="text-xs text-gray-400 mt-4">{new Date(fb.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>

        {/* Info Box about reviews */}
        <div className="lg:col-span-1">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 sticky top-24">
            <h2 className="text-xl font-bold text-azul-principal mb-4">{t("leaveReview")}</h2>
            <p className="text-sm text-gray-600 mb-6">
              {t("form.loginRequired")}
            </p>
            {!session && (
              <Link href={`/${locale}/auth/login`} className="block text-center bg-azul-principal text-white font-bold py-2 rounded hover:bg-opacity-90 transition">
                Fazer Login
              </Link>
            )}
            {session && (
               <p className="text-xs text-gray-500 italic">
                  Vá em &quot;Minhas Reservas&quot; para avaliar estadias concluídas.
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
