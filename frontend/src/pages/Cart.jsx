import { useTranslation } from 'react-i18next';

export default function Cart() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('checkout.order_summary')}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Cart is empty — cart state/context to be built alongside the products module.</p>
    </div>
  );
}
