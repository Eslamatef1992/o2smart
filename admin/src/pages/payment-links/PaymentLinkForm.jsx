import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMPTY = { description: '', amount: '', status: 'pending', expiresAt: '' };

const STATUS_OPTIONS = ['pending', 'paid', 'expired', 'cancelled'];

// datetime-local inputs need "YYYY-MM-DDTHH:mm"; the API returns/expects
// MySQL-style "YYYY-MM-DD HH:mm:ss".
function toInputValue(value) {
  if (!value) return '';
  return value.replace(' ', 'T').slice(0, 16);
}

function toApiValue(value) {
  if (!value) return null;
  return value.replace('T', ' ') + (value.length === 16 ? ':00' : '');
}

export default function PaymentLinkForm({ initial, onCancel, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...initial,
    expiresAt: toInputValue(initial?.expiresAt),
  }));
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
      const payload = { ...form, expiresAt: toApiValue(form.expiresAt) };
      if (!initial) {
        // New payment link: always starts 'pending', and `reference` is
        // generated server-side — don't send either from the client.
        delete payload.status;
      }
      await onSubmit(payload);
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
            <label>Description</label>
            <input value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Amount</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              required
            />
          </div>
          {initial && (
            <div className="form-field">
              <label>{t('common.status')}</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-field">
            <label>Expires At</label>
            <input type="datetime-local" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
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
