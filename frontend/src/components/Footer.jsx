import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-6)' }}>
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr repeat(4, 1fr)',
          gap: 'var(--space-4)',
          paddingBlock: 'var(--space-5)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <svg viewBox="0 0 100 100" width="32" height="32">
              <rect width="100" height="100" rx="20" fill="#090909" />
              <text x="50" y="68" fontSize="58" fontFamily="sans-serif" fontWeight="700" fill="#ffffff" textAnchor="middle">O2</text>
            </svg>
            <strong>{t('brand.name')}</strong>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{t('footer.description')}</p>
        </div>

        <FooterColumn title={t('footer.fast_links')}>
          <li><Link to="/">{t('common.home')}</Link></li>
          <li><Link to="/brands">{t('footer.brands')}</Link></li>
          <li><Link to="/cart">{t('cart.my_cart')}</Link></li>
        </FooterColumn>

        <FooterColumn title={t('footer.brands')}>
          <BrandLinks />
        </FooterColumn>

        <FooterColumn title={t('footer.about')}>
          <li><Link to="/about">{t('footer.about')}</Link></li>
          <li><Link to="/terms">{t('footer.terms')}</Link></li>
          <li><Link to="/privacy-policy">{t('footer.privacy')}</Link></li>
        </FooterColumn>

        <FooterColumn title={t('footer.customer_care')}>
          <li><a href="https://wa.me/96512345678" target="_blank" rel="noreferrer">{t('footer.whatsapp')}</a></li>
          <li><Link to="/contact-us">{t('footer.contact_us')}</Link></li>
          <li><Link to="/refund-policy">{t('footer.return_policy')}</Link></li>
        </FooterColumn>
      </div>

      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        <span>© {t('footer.powered_by')} Teknulugy</span>
        <span style={{ display: 'flex', gap: 8 }}>
          <PaymentBadge>KNET</PaymentBadge>
          <PaymentBadge>VISA</PaymentBadge>
          <PaymentBadge>MC</PaymentBadge>
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <strong style={{ fontSize: '0.85rem' }}>{title}</strong>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
        {children}
      </ul>
    </div>
  );
}

function BrandLinks() {
  // Static fallback list — the real brand catalog is browsable from the
  // dedicated /brands page; the footer just needs a few well-known shortcuts.
  return (
    <>
      <li><Link to="/brands">Apple</Link></li>
      <li><Link to="/brands">Samsung</Link></li>
      <li><Link to="/brands">Xiaomi</Link></li>
    </>
  );
}

function PaymentBadge({ children }) {
  return (
    <span style={{ border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
      {children}
    </span>
  );
}
