import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '../components/icons';
import { formatKwd } from '../utils/product';

export default function OrderSuccess() {
  const { t } = useTranslation();
  const location = useLocation();
  const order = location.state?.order;

  // Guards a page reload/direct link with no order in memory — the guest
  // cart has already been cleared, so there is nothing useful to show.
  if (!order) return <Navigate to="/" replace />;

  const itemCount = (order.items || []).reduce((sum, it) => sum + it.quantity, 0);
  const address = [order.shipping_address, order.shipping_city, order.shipping_governorate].filter(Boolean).join(', ');
  const paymentLabel = order.payment_method === 'cod' ? t('checkout.cash') : order.payment_method;

  return (
    <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <CheckCircleIcon width={56} height={56} style={{ color: 'var(--accent-green)', marginBottom: 'var(--space-2)' }} />
      <h1 style={{ margin: '0 0 4px' }}>{t('order_success.title')}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>{t('order_success.subtitle')}</p>

      <div style={{ textAlign: 'start', marginTop: 'var(--space-4)' }}>
        <SummaryRow label={t('order_success.order_id')} value={order.order_number} />
        <SummaryRow label={t('order_success.no_of_items')} value={`${itemCount} ${itemCount === 1 ? t('order_success.item') : t('order_success.items')}`} />
        {address && <SummaryRow label={t('order_success.address')} value={address} />}
        <SummaryRow label={t('order_success.delivery_time')} value={t('order_success.delivery_estimate')} />
        <SummaryRow label={t('order_success.payment_method')} value={paymentLabel} />
        <SummaryRow label={t('order_success.total')} value={`${formatKwd(order.total)} ${t('common.kwd')}`} strong />
      </div>

      <Link to="/" className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-4)' }}>
        {t('cart.continue_shopping')}
      </Link>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: '8px 0',
        borderBottom: '1px solid var(--color-border)',
        fontWeight: strong ? 700 : 400,
      }}
    >
      <span style={{ color: strong ? 'inherit' : 'var(--color-text-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
