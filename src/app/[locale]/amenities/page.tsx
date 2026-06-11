import { useTranslations } from "next-intl";

export default function AmenitiesPage() {
  const t = useTranslations("AmenitiesPage");

  const amenities = [
    { id: "ac", icon: "❄️" },
    { id: "breakfast", icon: "☕" },
    { id: "kitchen", icon: "🍳" },
    { id: "lavanderia", icon: "🧺" },
    { id: "linen", icon: "🛏️" },
    { id: "towels", icon: "🧖" },
    { id: "lockers", icon: "🔐" },
    { id: "reception", icon: "🕒" },
    { id: "parking", icon: "🚗" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-azul-principal mb-12 text-center">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition">
            <span className="text-4xl">{amenity.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t(`${amenity.id}.title`)}</h2>
              <p className="text-gray-600">{t(`${amenity.id}.description`)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
