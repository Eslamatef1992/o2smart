import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

// Shared implementation for both Orders (registered customers) and Guest
// Orders (no account) — the two admin nav items differ only in the
// `user_id IS NULL` filter, which the backend applies via ?guest=.
export default function OrdersList({ guest = false, basePath = '/orders', titleKey = 'nav.orders' }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('guest', guest ? 'true' : 'false');
      if (status) params.set('status', status);
      const { data } = await apiClient.get(`/orders?${params.toString()}`);
      setOrders(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setLoading(false);
    }
  }, [t, guest, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/orders/${id}`);
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
        <h1>{t(titleKey)}</h1>
        <Link to={`${basePath}/new`} className="btn btn-primary">
          {t('common.add_new')}
        </Link>
      </div>

      <div style={{ marginBottom: 12 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Payment</th>
                <th>{t('common.status')}</th>
                <th>Date</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.customer_phone || '—'}</td>
                  <td>{o.total} KWD</td>
                  <td>
                    <span className={`badge ${o.payment_status === 'paid' ? 'badge-active' : 'badge-inactive'}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td>{o.status}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`${basePath}/${o.id}/edit`} className="btn btn-outline btn-sm">
                        {t('common.edit')}
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === o.id}
                        onClick={() => handleDelete(o.id)}
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
    </div>
  );
}
