import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import PromoCodeForm from './PromoCodeForm';

// DB values come back as "YYYY-MM-DD HH:mm:ss" (dateStrings mode) — convert to
// the "YYYY-MM-DDTHH:mm" shape a <input type="datetime-local"> expects.
function toDatetimeLocal(value) {
  if (!value) return '';
  return String(value).slice(0, 16).replace(' ', 'T');
}

export default function PromoCodesList() {
  const { t } = useTranslation();
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/promo-codes');
      setPromoCodes(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(form) {
    if (editing && editing.id) {
      await apiClient.put(`/promo-codes/${editing.id}`, form);
    } else {
      await apiClient.post('/promo-codes', form);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/promo-codes/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t('nav.promoCodes')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : promoCodes.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((p) => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>{p.type}</td>
                  <td>{p.type === 'percentage' ? `${p.value}%` : Number(p.value).toFixed(3)}</td>
                  <td>{p.min_order_amount != null ? Number(p.min_order_amount).toFixed(3) : '-'}</td>
                  <td>
                    {p.used_count} / {p.usage_limit != null ? p.usage_limit : '∞'}
                  </td>
                  <td>{p.expires_at ? String(p.expires_at).slice(0, 16).replace('T', ' ') : '-'}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {p.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setEditing({
                            id: p.id,
                            code: p.code,
                            type: p.type,
                            value: p.value,
                            minOrderAmount: p.min_order_amount,
                            usageLimit: p.usage_limit,
                            startsAt: toDatetimeLocal(p.starts_at),
                            expiresAt: toDatetimeLocal(p.expires_at),
                            isActive: !!p.is_active,
                          })
                        }
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== null && (
        <PromoCodeForm initial={editing.id ? editing : null} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </div>
  );
}
