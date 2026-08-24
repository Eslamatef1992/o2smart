import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import ReviewForm from './ReviewForm';

function mapRowToForm(row) {
  return {
    id: row.id,
    productId: row.product_id ?? '',
    customerName: row.customer_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    adminReply: row.admin_reply,
  };
}

export default function ReviewsList() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/reviews', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      setReviews(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setLoading(false);
    }
  }, [t, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(form) {
    if (editing && editing.id) {
      await apiClient.put(`/reviews/${editing.id}`, form);
    } else {
      await apiClient.post('/reviews', form);
    }
    setEditing(null);
    await load();
  }

  async function handleQuickStatus(row, status) {
    setActioningId(row.id);
    setError('');
    try {
      await apiClient.put(`/reviews/${row.id}`, { ...mapRowToForm(row), status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setActioningId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/reviews/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setDeletingId(null);
    }
  }

  function renderStatus(status) {
    if (status === 'approved') {
      return <span className="badge badge-active">Approved</span>;
    }
    if (status === 'rejected') {
      return <span className="badge badge-inactive">Rejected</span>;
    }
    return (
      <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#b45309' }}>
        Pending
      </span>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t('nav.reviews')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="form-field" style={{ maxWidth: 240, marginBottom: 'var(--space-3)' }}>
        <label>{t('common.status')}</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Title</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((row) => (
                <tr key={row.id}>
                  <td>{row.product_name_en || '—'}</td>
                  <td>{row.customer_name}</td>
                  <td>{'★'.repeat(row.rating) + '☆'.repeat(5 - row.rating)}</td>
                  <td>{row.title}</td>
                  <td>{renderStatus(row.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={actioningId === row.id || row.status === 'approved'}
                        onClick={() => handleQuickStatus(row, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={actioningId === row.id || row.status === 'rejected'}
                        onClick={() => handleQuickStatus(row, 'rejected')}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditing(mapRowToForm(row))}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === row.id}
                        onClick={() => handleDelete(row.id)}
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
        <ReviewForm initial={editing.id ? editing : null} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </div>
  );
}
