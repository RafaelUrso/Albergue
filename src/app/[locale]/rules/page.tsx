import { useTranslations } from "next-intl";

export default function RulesPage() {
  const t = useTranslations("RulesPage");

  const sections = [
    "checkInOut",
    "commonAreas",
    "cancellation",
    "prohibitions",
    "noElevator",
    "lockers",
    "silence",
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-azul-principal mb-8 text-center">{t("title")}</h1>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-azul-principal">
            <h2 className="text-xl font-bold text-gray-800 mb-3">{t(`${section}.title`)}</h2>
            <p className="text-gray-600 leading-relaxed">{t(`${section}.content`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
