import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

export default function SettingsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient
      .get('/settings')
      .then(({ data }) => setForm(data.data))
      .catch((err) => setError(err.response?.data?.message || t('common.error_generic')))
      .finally(() => setLoading(false));
  }, [t]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await apiClient.put('/settings', form);
      setForm(data.data);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">{t('common.loading')}</div>;
  if (!form) return <div className="empty-state form-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{t('nav.settings')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 640 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-field">
            <label>Store Name (English)</label>
            <input value={form.store_name_en || ''} onChange={(e) => set('store_name_en', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Store Name (Arabic)</label>
            <input dir="rtl" value={form.store_name_ar || ''} onChange={(e) => set('store_name_ar', e.target.value)} />
          </div>
        </div>
        <div className="form-field">
          <label>Currency</label>
          <input value={form.currency || ''} onChange={(e) => set('currency', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-field">
            <label>Contact Email</label>
            <input type="email" value={form.contact_email || ''} onChange={(e) => set('contact_email', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Contact Phone</label>
            <input value={form.contact_phone || ''} onChange={(e) => set('contact_phone', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-field">
            <label>Contact WhatsApp</label>
            <input value={form.contact_whatsapp || ''} onChange={(e) => set('contact_whatsapp', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Free Shipping Threshold (KWD)</label>
            <input
              type="number"
              step="0.001"
              value={form.free_shipping_threshold || ''}
              onChange={(e) => set('free_shipping_threshold', e.target.value)}
              placeholder="Leave empty to disable"
            />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            style={{ width: 'auto' }}
            checked={form.cod_enabled === '1' || form.cod_enabled === true}
            onChange={(e) => set('cod_enabled', e.target.checked ? '1' : '0')}
          />
          Cash on Delivery enabled
        </label>

        {error && <p className="form-error">{error}</p>}
        {saved && <p style={{ color: 'var(--color-success, #2f9e44)', fontSize: '0.9rem' }}>Saved.</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
