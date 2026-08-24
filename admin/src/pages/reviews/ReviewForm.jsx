import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

const EMPTY = {
  productId: '',
  customerName: '',
  rating: 5,
  title: '',
  body: '',
  status: 'pending',
  adminReply: '',
};

export default function ReviewForm({ initial, onCancel, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const { data } = await apiClient.get('/products');
        if (!cancelled) setProducts(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        // The products module may not be deployed yet, or return no rows —
        // either way just fall back to an empty option list.
        if (!cancelled) setProducts([]);
      }
    }
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

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
        productId: form.productId === '' ? null : Number(form.productId),
        rating: Number(form.rating),
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
            <label>Product</label>
            <select value={form.productId ?? ''} onChange={(e) => set('productId', e.target.value)}>
              <option value="">— No product —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name_en || p.nameEn || `#${p.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Customer Name</label>
            <input value={form.customerName} onChange={(e) => set('customerName', e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Rating</label>
            <select value={form.rating} onChange={(e) => set('rating', e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Title</label>
            <input value={form.title || ''} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Body</label>
            <textarea rows={4} value={form.body || ''} onChange={(e) => set('body', e.target.value)} />
          </div>
          <div className="form-field">
            <label>{t('common.status')}</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="form-field">
            <label>Admin Reply</label>
            <textarea rows={3} value={form.adminReply || ''} onChange={(e) => set('adminReply', e.target.value)} />
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
