import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="card" style={{ borderRadius: 0, marginTop: 'var(--space-5)' }}>
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-4)',
          padding: 'var(--space-4) 0',
        }}
      >
        <div>
          <strong>O2 Smart</strong>
          <p style={{ color: 'var(--color-text-muted)' }}>
            O2 Smart is Kuwait&apos;s trusted online store for the latest smartphones, smart
            gadgets, and premium mobile accessories.
          </p>
        </div>
        <div>
          <strong>{t('footer.fast_links')}</strong>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/category/smart-phones">{t('nav.categories')}</Link></li>
          </ul>
        </div>
        <div>
          <strong>{t('footer.about')}</strong>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/about">{t('footer.about')}</Link></li>
            <li><Link to="/terms">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/refund-policy">Refund Policy</Link></li>
          </ul>
        </div>
        <div>
          <strong>{t('footer.customer_care')}</strong>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
        © Powered By Teknulugy
      </div>
    </footer>
  );
}
