import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';

function useProducts(query) {
  const [products, setProducts] = useState(null);
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get(`/products?activeOnly=true&${query}`)
      .then((res) => {
        if (!cancelled) setProducts(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);
  return products;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [banners, setBanners] = useState([]);

  const deals = useProducts('deals=true&limit=10');
  const newArrivals = useProducts('sort=newest&limit=10');
  const bestSellers = useProducts('limit=10');

  useEffect(() => {
    apiClient.get('/categories?activeOnly=true').then((res) => setCategories(res.data.data)).catch(() => setCategories([]));
    apiClient.get('/brands?activeOnly=true').then((res) => setBrands(res.data.data)).catch(() => setBrands([]));
    apiClient.get('/cms-banners?activeOnly=true').then((res) => setBanners(res.data.data)).catch(() => setBanners([]));
  }, []);

  const hero = banners[0];

  return (
    <div>
      {hero ? (
        <Link to={hero.link_url || '#'} style={{ display: 'block', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
          <img src={hero.image_url} alt={i18n.language === 'ar' ? hero.title_ar : hero.title_en} style={{ width: '100%', maxHeight: 340, objectFit: 'cover' }} />
        </Link>
      ) : (
        <div
          style={{
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-5)',
            padding: 'var(--space-6)',
            background: 'linear-gradient(135deg, var(--mine-900), var(--mine-700))',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{t('brand.name')}</h1>
        </div>
      )}

      {categories.length > 0 && (
        <section className="section">
          <div className="section-title">
            <h2>{t('nav.categories')}</h2>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <Link to={`/category/${c.slug}`} className="category-tile" key={c.id}>
                {c.image_url && <img src={c.image_url} alt="" />}
                <span>{i18n.language === 'ar' ? c.name_ar : c.name_en}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductRail titleKey="nav.top_deals" products={deals} />

      {brands.length > 0 && (
        <section className="section">
          <div className="section-title">
            <h2>{t('nav.our_brands')}</h2>
            <Link to="/brands" className="view-all">{t('nav.view_all')}</Link>
          </div>
          <div className="brand-grid">
            {brands.slice(0, 5).map((b) => (
              <Link to={`/brand/${b.slug}`} className="brand-tile" key={b.id}>
                {b.logo_url && <img className="brand-bg" src={b.logo_url} alt="" />}
                <span className="brand-logo">{i18n.language === 'ar' ? b.name_ar : b.name_en}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductRail titleKey="nav.new_arrivals" products={newArrivals} />
      <ProductRail titleKey="nav.best_seller" products={bestSellers} />
    </div>
  );
}

function ProductRail({ titleKey, products }) {
  const { t } = useTranslation();
  if (products === null) {
    return (
      <section className="section">
        <div className="section-title"><h2>{t(titleKey)}</h2></div>
        <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>
      </section>
    );
  }
  if (products.length === 0) return null;

  return (
    <section className="section">
      <div className="section-title">
        <h2>{t(titleKey)}</h2>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
