import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';
import { formatKwd } from '../utils/product';

// Mirrors the backend's flat shipping fee (orders.controller.js FLAT_SHIPPING_FEE)
// so the summary shown here matches what checkout actually charges. Waived
// once subtotal clears settings.free_shipping_threshold, same as the server.
const FLAT_SHIPPING_FEE = 2;

const emptyForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  shippingRegion: '',
  shippingAddress: '',
  shippingCity: '',
  shippingBlock: '',
  shippingGovernorate: '',
  postalCode: '',
  notes: '',
};

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lines, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [freeThreshold, setFreeThreshold] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get('/settings')
      .then((res) => setFreeThreshold(res.data.data.free_shipping_threshold ? Number(res.data.data.free_shipping_threshold) : null))
      .catch(() => setFreeThreshold(null));
  }, []);

  useEffect(() => {
    if (lines.length === 0) navigate('/cart', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length]);

  const shippingFee = freeThreshold && subtotal >= freeThreshold ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || lines.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.post('/orders/checkout', {
        ...form,
        items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
      });
      const order = res.data.data;
      clearCart();
      navigate('/order-success', { state: { order } });
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">{t('common.home')}</Link> {'>'} <Link to="/cart">{t('cart.title')}</Link> {'>'} {t('checkout.title')}
      </div>
      <h1 style={{ marginTop: 0 }}>{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-4)', alignItems: 'start' }}>
        <div>
          <section className="card" style={{ marginBottom: 'var(--space-3)' }}>
            <h2 style={{ marginTop: 0 }}>{t('checkout.delivery_address')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <Field label={t('checkout.full_name')} value={form.customerName} onChange={handleChange('customerName')} required />
              <Field label={t('checkout.phone')} value={form.customerPhone} onChange={handleChange('customerPhone')} required />
              <Field label={t('checkout.email')} value={form.customerEmail} onChange={handleChange('customerEmail')} type="email" />
              <Field label={t('checkout.governorate')} value={form.shippingGovernorate} onChange={handleChange('shippingGovernorate')} />
              <Field label={t('checkout.region')} value={form.shippingRegion} onChange={handleChange('shippingRegion')} />
              <Field label={t('checkout.city')} value={form.shippingCity} onChange={handleChange('shippingCity')} />
              <Field label={t('checkout.block')} value={form.shippingBlock} onChange={handleChange('shippingBlock')} />
              <Field label={t('checkout.postal_code')} value={form.postalCode} onChange={handleChange('postalCode')} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label={t('checkout.address')} value={form.shippingAddress} onChange={handleChange('shippingAddress')} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label={t('checkout.notes')} value={form.notes} onChange={handleChange('notes')} />
              </div>
            </div>
          </section>

          <section className="card" style={{ marginBottom: 'var(--space-3)' }}>
            <h2 style={{ marginTop: 0 }}>{t('checkout.shipping_method')}</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{t('checkout.shipping_method_placeholder')}</p>
          </section>

          <section className="card">
            <h2 style={{ marginTop: 0 }}>{t('checkout.payment_method')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="payment-option" style={{ opacity: 0.5 }} title={t('checkout.online_coming_soon')}>
                <input type="radio" name="payment" disabled />
                {t('checkout.knet')}
              </label>
              <label className="payment-option" style={{ opacity: 0.5 }} title={t('checkout.online_coming_soon')}>
                <input type="radio" name="payment" disabled />
                {t('checkout.credit_card')}
              </label>
              <label className="payment-option">
                <input type="radio" name="payment" checked readOnly />
                {t('checkout.cash')}
              </label>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('checkout.online_coming_soon')}</p>
          </section>
        </div>

        <aside className="card" style={{ position: 'sticky', top: 'var(--space-3)' }}>
          <h2 style={{ marginTop: 0 }}>{t('checkout.order_summary')}</h2>
          {lines.map((line) => (
            <div key={`${line.productId}:${line.variantId || 0}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '6px 0', color: 'var(--color-text-muted)' }}>
              <span>{line.nameEn} × {line.quantity}</span>
              <span>{formatKwd(line.price * line.quantity)} {t('common.kwd')}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
            <span>{t('checkout.subtotal')}</span>
            <span>{formatKwd(subtotal)} {t('common.kwd')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
            <span>{t('checkout.shipping_fees')}</span>
            <span>{shippingFee === 0 ? t('checkout.free') : `${formatKwd(shippingFee)} ${t('common.kwd')}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <span>{t('checkout.total')}</span>
            <span>{formatKwd(total)} {t('common.kwd')}</span>
          </div>
          {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? t('checkout.placing_order') : t('checkout.pay')}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label style={{ display: 'block', fontSize: '0.85rem' }}>
      {label}
      {required && ' *'}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        style={{ width: '100%', padding: 'var(--space-2)', marginTop: 4 }}
      />
    </label>
  );
}
