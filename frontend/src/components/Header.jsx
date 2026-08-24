import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

// Matches the Figma header: logo, search, account, cart, language switcher.
// The scrolling brand/offers ticker seen in the design is a later polish
// pass — left out of this first skeleton on purpose.
export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="card" style={{ borderRadius: 0, borderInline: 'none', borderTop: 'none' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
          O2 <span style={{ color: 'var(--color-text-muted)' }}>smart</span>
        </Link>

        <input
          type="search"
          placeholder={t('nav.search_placeholder')}
          style={{
            flex: 1,
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        />

        <Link to="/account">{t('nav.account')}</Link>
        <Link to="/cart">{t('nav.cart')}</Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
