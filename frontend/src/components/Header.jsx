import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import SearchOverlay from './SearchOverlay';
import { useCart } from '../context/CartContext';
import { CartIcon, MicIcon, SearchIcon, UserIcon } from './icons';
import { formatKwd } from '../utils/product';

const TICKER_KEYS = ['ticker.item1', 'ticker.item2', 'ticker.item3', 'ticker.item4'];

function Logo() {
  return (
    <Link to="/" className="site-header__logo" aria-label="O2 Smart home">
      <svg viewBox="0 0 100 100" width="40" height="40">
        <rect width="100" height="100" rx="20" fill="#090909" />
        <text x="50" y="68" fontSize="58" fontFamily="sans-serif" fontWeight="700" fill="#ffffff" textAnchor="middle">
          O2
        </text>
      </svg>
      <span style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.1 }}>
        O2
        <br />
        Smart
      </span>
    </Link>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const { count, subtotal, openDrawer } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  function submitSearch(e) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  }

  return (
    <header className="site-header">
      <div className="marquee">
        <div className="marquee__track">
          {[...TICKER_KEYS, ...TICKER_KEYS].map((key, i) => (
            <span className="marquee__item" key={`${key}-${i}`}>
              {t(key)}
            </span>
          ))}
        </div>
      </div>

      <div className="container site-header__bar">
        <Logo />

        <form className="site-header__search" onSubmit={submitSearch}>
          <input
            type="search"
            placeholder={t('nav.search_placeholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchOpen(true)}
          />
          {/* Voice search isn't implemented — the mic glyph mirrors the
              reference design but is decorative only, not a live control. */}
          <span className="icon-mic" aria-hidden="true">
            <MicIcon width={16} height={16} />
          </span>
          <button type="submit" className="icon-search btn-icon" aria-label={t('nav.search_placeholder')}>
            <SearchIcon width={18} height={18} />
          </button>
        </form>

        <div className="site-header__actions">
          <Link to="/login" className="btn-icon" aria-label={t('nav.account')}>
            <UserIcon />
          </Link>
          <button type="button" className="site-header__cart btn-icon" onClick={openDrawer} aria-label={t('nav.cart')}>
            <span style={{ position: 'relative' }}>
              <CartIcon />
              {count > 0 && <span className="site-header__cart-count">{count}</span>}
            </span>
            <span>{formatKwd(subtotal)} {t('common.kwd')}</span>
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="container site-header__meta">
        <a href="tel:+96512345678">+965 1234 5678</a>
        <a href="mailto:order@o2smart.com">order@o2smart.com</a>
      </div>

      {searchOpen && (
        <SearchOverlay
          value={searchValue}
          onChange={setSearchValue}
          onClose={() => setSearchOpen(false)}
          onSubmit={submitSearch}
        />
      )}
    </header>
  );
}
