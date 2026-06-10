'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { getConfiguracao, updateConfiguracao } from '@/lib/actions/cancellation';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminSettingsPage() {
  const t = useTranslations('Admin.settings');
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    feeType: 'PERCENT',
    feeValue: '20',
    maxFee: '100'
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user && (session.user as { perfil?: string }).perfil !== 'ADMIN_GERAL')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const feeType = await getConfiguracao('CANCELLATION_FEE_TYPE') || 'PERCENT';
        const feeValue = await getConfiguracao('CANCELLATION_FEE_VALUE') || '20';
        const maxFee = await getConfiguracao('CANCELLATION_MAX_FEE') || '100';
        setConfig({ feeType, feeValue, maxFee });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfiguracao('CANCELLATION_FEE_TYPE', config.feeType);
      await updateConfiguracao('CANCELLATION_FEE_VALUE', config.feeValue);
      await updateConfiguracao('CANCELLATION_MAX_FEE', config.maxFee);
      alert(t('saveSuccess'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving config');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) return <div className="p-8">{t('loading')}</div>;

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <button
          onClick={() => router.push(`/${locale}/admin/dashboard`)}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          {t('backToDashboard')}
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">{t('cancellationPolicy')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('feeType')}</label>
              <select
                value={config.feeType}
                onChange={e => setConfig({...config, feeType: e.target.value})}
                className="w-full border rounded-lg p-2"
              >
                <option value="PERCENT">{t('percentage')}</option>
                <option value="FIXED">{t('fixedValue')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('feeValue')} ({config.feeType === 'PERCENT' ? '%' : 'R$'})</label>
              <input
                type="number"
                step="0.01"
                value={config.feeValue}
                onChange={e => setConfig({...config, feeValue: e.target.value})}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t('maxFee')} (%)</label>
              <input
                type="number"
                step="0.01"
                value={config.maxFee}
                onChange={e => setConfig({...config, maxFee: e.target.value})}
                className="w-full border rounded-lg p-2"
                required
              />
              <p className="text-xs text-gray-400">{t('maxFeeHint')}</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-azul-principal text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
