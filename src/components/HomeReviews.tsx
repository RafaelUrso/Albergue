'use client';

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { getApprovedFeedbacks } from "@/lib/actions/feedback";

interface FeedbackWithUser {
  id: string;
  nota: number;
  comentario: string | null;
  createdAt: Date;
  usuario: {
    nomeCompleto: string;
  };
}

export default function HomeReviews() {
  const t = useTranslations("FeedbackPage");
  const [feedbacks, setFeedbacks] = useState<FeedbackWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedFeedbacks().then(data => {
      // Show only top 3 recent feedbacks
      setFeedbacks((data as FeedbackWithUser[]).slice(0, 3));
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-principal"></div>
    </div>
  );

  if (feedbacks.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-azul-principal mb-10 text-center">
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-gray-800 text-sm">{fb.usuario.nomeCompleto}</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < fb.nota ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 italic text-sm line-clamp-4">&quot;{fb.comentario}&quot;</p>
              <p className="text-[10px] text-gray-400 mt-4">{new Date(fb.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
