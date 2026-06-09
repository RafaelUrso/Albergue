import { useTranslations } from 'next-intl';

export default function HostelMapPage() {
  const t = useTranslations('HostelMap');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">{t('title')}</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg overflow-x-auto">
        {/* Hostel Map SVG */}
        <svg viewBox="0 0 800 600" className="w-full h-auto min-w-[600px] border-2 border-gray-200 rounded">
          {/* Background / Floor */}
          <rect x="0" y="0" width="800" height="600" fill="#f8fafc" />

          {/* Corridor */}
          <rect x="350" y="50" width="100" height="500" fill="#e2e8f0" />
          <text x="400" y="300" textAnchor="middle" fill="#64748b" fontSize="14" fontWeight="bold" transform="rotate(-90 400 300)">{t('corridor')}</text>

          {/* Room 101 (Type A - 4 beds, Private Bath) */}
          <g id="room-101">
            <rect x="50" y="50" width="300" height="150" fill="white" stroke="#3b82f6" strokeWidth="2" />
            <text x="60" y="75" className="font-bold fill-blue-600">{t('room')} 101 (A)</text>

            {/* Private Bathroom */}
            <rect x="50" y="50" width="80" height="60" fill="#dcfce7" stroke="#22c55e" />
            <text x="90" y="85" textAnchor="middle" fontSize="10" fill="#166534">{t('bath')}</text>

            {/* Beds */}
            <rect x="150" y="70" width="40" height="25" rx="2" fill="#bfdbfe" stroke="#2563eb" />
            <rect x="150" y="105" width="40" height="25" rx="2" fill="#bfdbfe" stroke="#2563eb" />
            <rect x="250" y="70" width="40" height="25" rx="2" fill="#bfdbfe" stroke="#2563eb" />
            <rect x="250" y="105" width="40" height="25" rx="2" fill="#bfdbfe" stroke="#2563eb" />
          </g>

          {/* Room 102 (Type B - 8 beds, Corridor Bath) */}
          <g id="room-102">
            <rect x="50" y="220" width="300" height="200" fill="white" stroke="#3b82f6" strokeWidth="2" />
            <text x="60" y="245" className="font-bold fill-blue-600">{t('room')} 102 (B)</text>

            {/* Beds */}
            {[...Array(8)].map((_, i) => (
              <rect
                key={i}
                x={140 + (i % 2) * 80}
                y={260 + Math.floor(i / 2) * 35}
                width="40" height="25" rx="2" fill="#bfdbfe" stroke="#2563eb"
              />
            ))}
          </g>

          {/* Shared Bathroom (Corridor) */}
          <g id="shared-bath">
            <rect x="50" y="440" width="120" height="110" fill="#fee2e2" stroke="#ef4444" />
            <text x="110" y="500" textAnchor="middle" fontSize="12" fill="#991b1b">{t('sharedBath')}</text>
          </g>

          {/* Room 103 (Type C - 12 beds, Private Bath) */}
          <g id="room-103">
            <rect x="450" y="50" width="300" height="250" fill="white" stroke="#3b82f6" strokeWidth="2" />
            <text x="460" y="75" className="font-bold fill-blue-600">{t('room')} 103 (C)</text>

            {/* Private Bathroom */}
            <rect x="670" y="50" width="80" height="80" fill="#dcfce7" stroke="#22c55e" />
            <text x="710" y="95" textAnchor="middle" fontSize="10" fill="#166534">{t('bath')}</text>

            {/* Beds */}
            {[...Array(12)].map((_, i) => (
              <rect
                key={i}
                x={480 + (i % 3) * 60}
                y={110 + Math.floor(i / 3) * 35}
                width="40" height="25" rx="2" fill="#bfdbfe" stroke="#2563eb"
              />
            ))}
          </g>

          {/* Common Areas */}
          <g id="kitchen">
            <rect x="450" y="320" width="140" height="110" fill="#fef9c3" stroke="#eab308" />
            <text x="520" y="380" textAnchor="middle" fontSize="14" fill="#854d0e">{t('kitchen')}</text>
          </g>

          <g id="laundry">
            <rect x="610" y="320" width="140" height="110" fill="#fef9c3" stroke="#eab308" />
            <text x="680" y="380" textAnchor="middle" fontSize="14" fill="#854d0e">{t('laundry')}</text>
          </g>

          <g id="refectory">
            <rect x="450" y="450" width="300" height="100" fill="#fef9c3" stroke="#eab308" />
            <text x="600" y="505" textAnchor="middle" fontSize="14" fill="#854d0e">{t('refectory')}</text>
          </g>

        </svg>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-blue-500"></div>
          <span>{t('legend.room')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-500"></div>
          <span>{t('legend.privateBath')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-500"></div>
          <span>{t('legend.sharedBath')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-500"></div>
          <span>{t('legend.commonArea')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 border border-blue-600 rounded"></div>
          <span>{t('legend.bed')}</span>
        </div>
      </div>
    </div>
  );
}
