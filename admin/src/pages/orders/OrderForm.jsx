import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUS_OPTIONS = ['unpaid', 'paid', 'refunded'];
const PAYMENT_METHOD_OPTIONS = ['cod', 'sadad'];

const EMPTY = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  status: 'pending',
  paymentStatus: 'unpaid',
  paymentMethod: 'cod',
  shippingRegion: '',
  shippingAddress: '',
  shippingCity: '',
  shippingBlock: '',
  shippingGovernorate: '',
  postalCode: '',
  discount: 0,
  shippingFee: 0,
  promoCode: '',
  notes: '',
};

const EMPTY_ITEM = { nameEnSnapshot: '', nameArSnapshot: '', skuSnapshot: '', price: '', quantity: 1 };

// Shared form for both Orders and Guest Orders (basePath/backLabelKey let the
// wrapper route control where "back" and "save" navigate/return to).
export default function OrderForm({ basePath = '/orders', backLabelKey = 'nav.orders' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY);
  const [items, setItems] = useState(isEdit ? [] : [{ ...EMPTY_ITEM }]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/products').then(({ data }) => setProducts(data.data)).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiClient
      .get(`/orders/${id}`)
      .then(({ data }) => {
        const o = data.data;
        setForm({
          customerName: o.customer_name || '',
          customerEmail: o.customer_email || '',
          customerPhone: o.customer_phone || '',
          status: o.status,
          paymentStatus: o.payment_status,
          paymentMethod: o.payment_method,
          shippingRegion: o.shipping_region || '',
          shippingAddress: o.shipping_address || '',
          shippingCity: o.shipping_city || '',
          shippingBlock: o.shipping_block || '',
          shippingGovernorate: o.shipping_governorate || '',
          postalCode: o.postal_code || '',
          discount: o.discount || 0,
          shippingFee: o.shipping_fee || 0,
          promoCode: o.promo_code || '',
          notes: o.notes || '',
        });
        setItems(
          (o.items || []).map((it) => ({
            nameEnSnapshot: it.name_en_snapshot,
            nameArSnapshot: it.name_ar_snapshot,
            skuSnapshot: it.sku_snapshot || '',
            price: it.price,
            quantity: it.quantity,
          }))
        );
        setStatusHistory(o.statusHistory || []);
      })
      .catch((err) => setError(err.response?.data?.message || t('common.error_generic')))
      .finally(() => setLoading(false));
  }, [id, isEdit, t]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addItem() {
    setItems((its) => [...its, { ...EMPTY_ITEM }]);
  }
  function updateItem(index, patch) {
    setItems((its) => its.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function removeItem(index) {
    setItems((its) => its.filter((_, i) => i !== index));
  }
  function pickProduct(index, productId) {
    const p = products.find((pr) => String(pr.id) === String(productId));
    if (!p) return;
    updateItem(index, {
      nameEnSnapshot: p.name_en,
      nameArSnapshot: p.name_ar,
      skuSnapshot: p.sku,
      price: p.sale_price || p.price,
      productId: p.id,
    });
  }

  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const total = subtotal - (Number(form.discount) || 0) + (Number(form.shippingFee) || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isEdit && items.filter((it) => it.nameEnSnapshot).length === 0) {
      setError('Add at least one item.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      discount: Number(form.discount) || 0,
      shippingFee: Number(form.shippingFee) || 0,
      items: items
        .filter((it) => it.nameEnSnapshot)
        .map((it) => ({ ...it, price: Number(it.price), quantity: Number(it.quantity) })),
    };
    try {
      if (isEdit) {
        await apiClient.put(`/orders/${id}`, payload);
      } else {
        await apiClient.post('/orders', payload);
      }
      navigate(basePath);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">{t('common.loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? t('common.edit') : t('common.add_new')} — {t(backLabelKey)}</h1>
        <Link to={basePath} className="btn btn-outline btn-sm">
          ← {t(backLabelKey)}
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Customer</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>Name</label>
              <input value={form.customerName} onChange={(e) => set('customerName', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={form.customerEmail} onChange={(e) => set('customerEmail', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input value={form.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Shipping</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>Governorate</label>
              <input value={form.shippingGovernorate} onChange={(e) => set('shippingGovernorate', e.target.value)} />
            </div>
            <div className="form-field">
              <label>City / Area</label>
              <input value={form.shippingCity} onChange={(e) => set('shippingCity', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Block</label>
              <input value={form.shippingBlock} onChange={(e) => set('shippingBlock', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>Address</label>
              <input value={form.shippingAddress} onChange={(e) => set('shippingAddress', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Region</label>
              <input value={form.shippingRegion} onChange={(e) => set('shippingRegion', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Postal Code</label>
              <input value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Items</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
              + Add Item
            </button>
          </div>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Product</label>
                <select onChange={(e) => pickProduct(i, e.target.value)} defaultValue="">
                  <option value="">— Pick a product to fill in, or type manually below —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_en} ({p.sku})
                    </option>
                  ))}
                </select>
                <input
                  style={{ marginTop: 6 }}
                  placeholder="Item name (English)"
                  value={it.nameEnSnapshot}
                  onChange={(e) => updateItem(i, { nameEnSnapshot: e.target.value })}
                />
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Price (KWD)</label>
                <input type="number" step="0.001" value={it.price} onChange={(e) => updateItem(i, { price: e.target.value })} />
              </div>
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Qty</label>
                <input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} />
              </div>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>
                Remove
              </button>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
            <div className="form-field">
              <label>Discount (KWD)</label>
              <input type="number" step="0.001" value={form.discount} onChange={(e) => set('discount', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Shipping Fee (KWD)</label>
              <input type="number" step="0.001" value={form.shippingFee} onChange={(e) => set('shippingFee', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Promo Code</label>
              <input value={form.promoCode} onChange={(e) => set('promoCode', e.target.value)} />
            </div>
          </div>
          <p style={{ textAlign: 'right', fontSize: '0.95rem' }}>
            Subtotal: {subtotal.toFixed(3)} KWD &nbsp;·&nbsp; <strong>Total: {total.toFixed(3)} KWD</strong>
          </p>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Status & Payment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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
            <div className="form-field">
              <label>Payment Status</label>
              <select value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)}>
                {PAYMENT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
                {PAYMENT_METHOD_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>

          {isEdit && statusHistory.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: 6 }}>Status History</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingInlineStart: 18 }}>
                {statusHistory.map((h) => (
                  <li key={h.id}>
                    {new Date(h.created_at).toLocaleString()} — {h.status} {h.admin_name ? `(${h.admin_name})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Link to={basePath} className="btn btn-outline">
            {t('common.cancel')}
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
