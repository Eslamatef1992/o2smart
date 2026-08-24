import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMPTY = { valueEn: '', valueAr: '', hexCode: '', sortOrder: 0 };

export default function AttributeValueForm({ initial, attributeId, onCancel, onSubmit }) {
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
      await onSubmit({ ...form, attributeId });
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
            <label>Value (English)</label>
            <input value={form.valueEn} onChange={(e) => set('valueEn', e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Value (Arabic)</label>
            <input value={form.valueAr} onChange={(e) => set('valueAr', e.target.value)} required dir="rtl" />
          </div>
          <div className="form-field">
            <label>Hex Code</label>
            <input
              type="text"
              value={form.hexCode || ''}
              onChange={(e) => set('hexCode', e.target.value)}
              placeholder="#000000"
            />
          </div>
          <div className="form-field">
            <label>Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
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
