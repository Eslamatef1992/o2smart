import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { CloseIcon, SearchIcon } from './icons';
import { localizedName, formatKwd, effectivePricing, discountPercent } from '../utils/product';

// Full-screen quick-search overlay. The reference design also shows
// "Collection" and "Blog" result columns — this storefront has neither
// concept (no collections/blog module), so the overlay focuses on what's
// real: text suggestions plus a live product preview.
export default function SearchOverlay({ value, onChange, onClose, onSubmit }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      apiClient
        .get(`/products?search=${encodeURIComponent(query)}&activeOnly=true&limit=6`)
        .then((res) => setResults(res.data.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [value]);

  function goToProduct(id) {
    onClose();
    navigate(`/product/${id}`);
  }

  return (
    <div className="search-overlay" role="dialog" aria-modal="true">
      <button type="button" className="btn-icon" style={{ position: 'absolute', top: 16, insetInlineEnd: 16 }} onClick={onClose} aria-label="Close search">
        <CloseIcon />
      </button>

      <form className="search-overlay__top" onSubmit={onSubmit}>
        <input
          autoFocus
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('nav.search_placeholder')}
        />
        <button type="submit" className="btn-icon">
          <SearchIcon width={22} height={22} />
        </button>
      </form>

      <div className="search-overlay__grid">
        <div>
          <h3>{t('search.suggestions')}</h3>
          <div>
            {['iPhone', 'Samsung Galaxy', 'AirPods', 'Smart Watch'].map((s) => (
              <button
                type="button"
                key={s}
                className="search-overlay__chip"
                onClick={() => {
                  onChange(s);
                  navigate(`/search?q=${encodeURIComponent(s)}`);
                  onClose();
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3>{t('search.products')}</h3>
          {loading && <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>}
          {!loading && value.trim().length >= 2 && results.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)' }}>{t('search.no_results')}</p>
          )}
          {results.map((p) => {
            const { price, salePrice } = effectivePricing(p);
            return (
              <div key={p.id} className="search-result-row" role="button" tabIndex={0} onClick={() => goToProduct(p.id)}>
                <img src={p.thumbnail_url || undefined} alt="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{localizedName(p, i18n.language)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {salePrice ? (
                      <>
                        <span style={{ textDecoration: 'line-through', marginInlineEnd: 6 }}>{formatKwd(price)}</span>
                        <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{formatKwd(salePrice)} {t('common.kwd')}</span>
                      </>
                    ) : (
                      <span>{formatKwd(price)} {t('common.kwd')}</span>
                    )}
                  </div>
                </div>
                {discountPercent(price, salePrice) && <span className="badge badge-discount">-{discountPercent(price, salePrice)}%</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
