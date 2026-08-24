import { useTranslation } from 'react-i18next';

// Placeholder shape until the products API exists — matches the fields
// visible on the Figma product card: image, badge, title, sku, price, colors.
export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { titleEn, titleAr, sku, price, oldPrice, image, lang } = product;
  const title = lang === 'ar' ? titleAr : titleEn;

  return (
    <div className="card">
      <img src={image} alt={title} style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{sku}</div>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div>
        <span style={{ fontWeight: 700 }}>{price}</span>{' '}
        {oldPrice && (
          <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
            {oldPrice}
          </span>
        )}
      </div>
      <button type="button" className="btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
        {t('product.add_to_cart')}
      </button>
    </div>
  );
}
