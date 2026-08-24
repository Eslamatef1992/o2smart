import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ProductDetails() {
  const { t } = useTranslation();
  const { id } = useParams();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
      <div className="card">Image gallery placeholder (product #{id})</div>
      <div>
        <h1>Product title</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>SKU: TBD</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>0.000 KWD</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
          <button type="button" className="btn-outline">{t('product.add_to_cart')}</button>
          <button type="button" className="btn-primary">{t('product.buy_now')}</button>
        </div>
      </div>
    </div>
  );
}
