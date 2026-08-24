import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMPTY = {
  code: '',
  type: 'percentage',
  value: 0,
  minOrderAmount: '',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

export default function PromoCodeForm({ initial, onCancel, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        minOrderAmount: form.minOrderAmount === '' ? null : form.minOrderAmount,
        usageLimit: form.usageLimit === '' ? null : form.usageLimit,
        startsAt: form.startsAt === '' ? null : form.startsAt,
        expiresAt: form.expiresAt === '' ? null : form.expiresAt,
      });
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>{initial ? t('common.edit') : t('common.add_new')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Code</label>
            <input value={form.code} onChange={(e) => set('code', e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} required>
              <option value="percentage">percentage</option>
              <option value="fixed">fixed</option>
            </select>
          </div>
          <div className="form-field">
            <label>Value</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={form.value}
              onChange={(e) => set('value', Number(e.target.value))}
              required
            />
          </div>
          <div className="form-field">
            <label>Min Order Amount</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={form.minOrderAmount ?? ''}
              onChange={(e) => set('minOrderAmount', e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div className="form-field">
            <label>Usage Limit (leave blank for unlimited)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={form.usageLimit ?? ''}
              onChange={(e) => set('usageLimit', e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div className="form-field">
            <label>Starts At</label>
            <input
              type="datetime-local"
              value={form.startsAt || ''}
              onChange={(e) => set('startsAt', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Expires At</label>
            <input
              type="datetime-local"
              value={form.expiresAt || ''}
              onChange={(e) => set('expiresAt', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                style={{ width: 'auto' }}
              />
              {t('common.active')}
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
