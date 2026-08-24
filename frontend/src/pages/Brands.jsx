import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';

export default function Brands() {
  const { t, i18n } = useTranslation();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/brands?activeOnly=true')
      .then((res) => setBrands(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">{t('common.home')}</Link> {'>'} {t('brands_page.title')}
      </div>
      <h1 style={{ marginTop: 0 }}>{t('brands_page.title')}</h1>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>}
      {!loading && brands.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>{t('filters.no_products')}</p>}

      <div className="brand-grid">
        {brands.map((b) => (
          <Link to={`/brand/${b.slug}`} className="brand-tile" key={b.id}>
            {b.logo_url && <img className="brand-bg" src={b.logo_url} alt="" />}
            <span className="brand-logo">{i18n.language === 'ar' ? b.name_ar : b.name_en}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
