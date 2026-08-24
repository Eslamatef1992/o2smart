import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import PaymentLinkForm from './PaymentLinkForm';

function StatusBadge({ status }) {
  if (status === 'paid') {
    return <span className="badge badge-active">Paid</span>;
  }
  if (status === 'expired') {
    return <span className="badge badge-inactive">Expired</span>;
  }
  if (status === 'cancelled') {
    return <span className="badge badge-inactive">Cancelled</span>;
  }
  // 'pending' — no dedicated badge class exists for this status yet.
  return (
    <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#b45309' }}>
      Pending
    </span>
  );
}

export default function PaymentLinksList() {
  const { t } = useTranslation();
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/payment-links');
      setPaymentLinks(data.data);
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
      await apiClient.put(`/payment-links/${editing.id}`, form);
    } else {
      await apiClient.post('/payment-links', form);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/payment-links/${id}`);
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
        <h1>{t('nav.paymentLinks')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : paymentLinks.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Description</th>
                <th>Amount</th>
                <th>{t('common.status')}</th>
                <th>Created</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paymentLinks.map((p) => (
                <tr key={p.id}>
                  <td>
                    <code>{p.reference}</code>
                  </td>
                  <td>{p.description}</td>
                  <td>{`${p.amount} KWD`}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>{p.created_at}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setEditing({
                            id: p.id,
                            description: p.description,
                            amount: p.amount,
                            status: p.status,
                            expiresAt: p.expires_at,
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
        <PaymentLinkForm initial={editing.id ? editing : null} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </div>
  );
}
