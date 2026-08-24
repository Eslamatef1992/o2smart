import { useTranslation } from 'react-i18next';

// Per build-spec.md §5/§8: address (Kuwait-specific fields) -> shipping
// method -> payment method (KNET / card / cash first; Sadad wired in once
// sandbox credentials exist). COD ships first end-to-end per the build order.
export default function Checkout() {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-4)' }}>
      <div>
        <section className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <h2>{t('checkout.delivery_address')}</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Region, Address, Postal Code, City, Block, Governorate — form TODO.</p>
        </section>
        <section className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <h2>{t('checkout.shipping_method')}</h2>
        </section>
        <section className="card">
          <h2>{t('checkout.payment_method')}</h2>
          <ul>
            <li>{t('checkout.knet')}</li>
            <li>{t('checkout.credit_card')}</li>
            <li>{t('checkout.cash')}</li>
          </ul>
          <button type="button" className="btn-primary" style={{ width: '100%' }}>{t('checkout.pay')}</button>
        </section>
      </div>
      <aside className="card">
        <h2>{t('checkout.order_summary')}</h2>
        <p>{t('checkout.subtotal')}: 0.000 KWD</p>
        <p>{t('checkout.discount')}: 0%</p>
        <p>{t('checkout.shipping_fees')}: TBD</p>
        <strong>{t('checkout.total')}: 0.000 KWD</strong>
      </aside>
    </div>
  );
}
