'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { getAllTariffs, saveTariff, deleteTariff } from '@/lib/actions/tariff';
import { QuartoTipo, TarifaTipo } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { formatDisplayDate, formatDateToISO } from '@/lib/date-utils';

type TarifaDisplay = {
  id: string;
  quartoTipo: QuartoTipo;
  valorDiaria: number;
  tipo: TarifaTipo;
  dataInicio: Date | null;
  dataFim: Date | null;
  criadoPorId: string;
  createdAt: Date;
};

export default function TariffsPage() {
  const t = useTranslations('Admin.tariffs');
  const ts = useTranslations('Admin.settings');
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = useParams();

  const [tariffs, setTariffs] = useState<TarifaDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    quartoTipo: QuartoTipo;
    valorDiaria: number;
    tipo: TarifaTipo;
    dataInicio: string;
    dataFim: string;
  }>({
    quartoTipo: QuartoTipo.TIPO_8_LEITOS,
    valorDiaria: 0,
    tipo: TarifaTipo.PADRAO,
    dataInicio: '',
    dataFim: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user && (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL')) {
      router.push('/');
    }
  }, [status, session, router]);

  const loadTariffs = async () => {
    try {
      const data = await getAllTariffs();
      setTariffs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        const data = await getAllTariffs();
        setTariffs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTariffs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTariff({
        id: editingId || undefined,
        ...formData,
        dataInicio: formData.dataInicio ? new Date(formData.dataInicio) : null,
        dataFim: formData.dataFim ? new Date(formData.dataFim) : null,
      });
      setEditingId(null);
      setFormData({
        quartoTipo: QuartoTipo.TIPO_8_LEITOS,
        valorDiaria: 0,
        tipo: TarifaTipo.PADRAO,
        dataInicio: '',
        dataFim: '',
      });
      loadTariffs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving tariff');
    }
  };

  const handleEdit = (tariff: TarifaDisplay) => {
    setEditingId(tariff.id);
    setFormData({
      quartoTipo: tariff.quartoTipo,
      valorDiaria: Number(tariff.valorDiaria),
      tipo: tariff.tipo,
      dataInicio: tariff.dataInicio ? formatDateToISO(new Date(tariff.dataInicio)) : '',
      dataFim: tariff.dataFim ? formatDateToISO(new Date(tariff.dataFim)) : '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await deleteTariff(id);
      loadTariffs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting tariff');
    }
  };

  if (status === 'loading' || loading) return <div className="p-8">{t('loading')}</div>;

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
           <button
            onClick={() => router.push(`/${locale}/admin/dashboard`)}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            {ts('backToDashboard')}
          </button>
          <button
            onClick={() => router.push(`/${locale}/admin/settings`)}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition"
          >
            {ts('title')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-xl mb-4">{editingId ? t('edit') : t('add')}</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('roomType')}</label>
              <select
                value={formData.quartoTipo}
                onChange={e => setFormData({...formData, quartoTipo: e.target.value as QuartoTipo})}
                className="w-full border rounded-lg p-2"
              >
                {Object.values(QuartoTipo).map(v => (
                  <option key={v} value={v}>
                    {v.replace('TIPO_', '').replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('type')}</label>
              <select
                value={formData.tipo}
                onChange={e => setFormData({...formData, tipo: e.target.value as TarifaTipo})}
                className="w-full border rounded-lg p-2"
              >
                <option value="PADRAO">{t('standard')}</option>
                <option value="SAZONAL">{t('seasonal')}</option>
                <option value="PROMOCIONAL">{t('promotional')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('dailyRate')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.valorDiaria}
                onChange={e => setFormData({...formData, valorDiaria: parseFloat(e.target.value) || 0})}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            {formData.tipo !== 'PADRAO' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t('startDate')}</label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={e => setFormData({...formData, dataInicio: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t('endDate')}</label>
                  <input
                    type="date"
                    value={formData.dataFim}
                    onChange={e => setFormData({...formData, dataFim: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="w-full bg-azul-principal text-white py-2 rounded-lg font-bold">
              {t('save')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    quartoTipo: QuartoTipo.TIPO_8_LEITOS,
                    valorDiaria: 0,
                    tipo: TarifaTipo.PADRAO,
                    dataInicio: '',
                    dataFim: '',
                  });
                }}
                className="w-full text-gray-500 py-2"
              >
                Cancelar
              </button>
            )}
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-500">
                <tr>
                  <th className="p-4">{t('roomType')}</th>
                  <th className="p-4">{t('type')}</th>
                  <th className="p-4">{t('dailyRate')}</th>
                  <th className="p-4">{t('startDate')} / {t('endDate')}</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tariffs.map(tariff => (
                  <tr key={tariff.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">
                      {tariff.quartoTipo.replace('TIPO_', '').replace('_', ' ')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        tariff.tipo === 'PADRAO' ? 'bg-gray-100 text-gray-600' :
                        tariff.tipo === 'SAZONAL' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {tariff.tipo === 'PADRAO' ? t('standard') :
                         tariff.tipo === 'SAZONAL' ? t('seasonal') :
                         t('promotional')}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-azul-principal">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(tariff.valorDiaria))}
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {tariff.dataInicio ? formatDisplayDate(new Date(tariff.dataInicio), locale as string) : '-'}
                      {tariff.dataFim ? ` to ${formatDisplayDate(new Date(tariff.dataFim), locale as string)}` : ''}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(tariff)}
                        className="bg-azul-principal text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 transition"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(tariff.id)}
                        className="border border-red-600 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-50 transition"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
                {tariffs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">{t('noTariffs')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
