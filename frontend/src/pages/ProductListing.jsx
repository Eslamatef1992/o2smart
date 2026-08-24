import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import FilterDropdown from '../components/FilterDropdown';
import { groupVariantAttributes, effectivePricing } from '../utils/product';

// Shared listing/grid used by Category, Search, and brand-filtered browsing.
// Facets (brand, and whatever attributes — Storage, Color, ...— actually
// appear on the fetched products) are computed client-side from the current
// result set. That's a reasonable approach at this catalog's scale; a
// dedicated faceted-search index would be the next step if the catalog
// grows much larger.
export default function ProductListing({ title, breadcrumb, fetchParams }) {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedAttrValues, setSelectedAttrValues] = useState(new Set());
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('default');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ activeOnly: 'true', ...fetchParams });
    apiClient
      .get(`/products?${params.toString()}`)
      .then((res) => setProducts(res.data.data))
      .catch((err) => setError(err.response?.data?.message || t('common.error_generic')))
      .finally(() => setLoading(false));
  }, [JSON.stringify(fetchParams), t]);

  const brandOptions = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.brand_id && !map.has(p.brand_id)) map.set(p.brand_id, { id: p.brand_id, label: p.brand_name_en });
    });
    return Array.from(map.values());
  }, [products]);

  const attributeGroupOptions = useMemo(() => {
    const allVariants = products.flatMap((p) => p.variants || []);
    return groupVariantAttributes(allVariants);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedBrands.size > 0) list = list.filter((p) => selectedBrands.has(p.brand_id));
    if (selectedAttrValues.size > 0) {
      list = list.filter((p) =>
        (p.variants || []).some((v) => (v.attributeValues || []).some((av) => selectedAttrValues.has(av.id)))
      );
    }
    if (minPrice) list = list.filter((p) => effectivePricing(p).price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => effectivePricing(p).price <= Number(maxPrice));
    if (inStockOnly) list = list.filter((p) => Number(p.stock_quantity) > 0 || (p.variants || []).some((v) => Number(v.stock_quantity) > 0));

    const withPrice = list.map((p) => ({ p, eff: effectivePricing(p) }));
    switch (sort) {
      case 'newest':
        withPrice.sort((a, b) => new Date(b.p.created_at) - new Date(a.p.created_at));
        break;
      case 'price_asc':
        withPrice.sort((a, b) => (a.eff.salePrice ?? a.eff.price) - (b.eff.salePrice ?? b.eff.price));
        break;
      case 'price_desc':
        withPrice.sort((a, b) => (b.eff.salePrice ?? b.eff.price) - (a.eff.salePrice ?? a.eff.price));
        break;
      case 'deals':
        withPrice.sort((a, b) => {
          const da = a.eff.salePrice ? (a.eff.price - a.eff.salePrice) / a.eff.price : -1;
          const db = b.eff.salePrice ? (b.eff.price - b.eff.salePrice) / b.eff.price : -1;
          return db - da;
        });
        break;
      default:
        break;
    }
    return withPrice.map((x) => x.p);
  }, [products, selectedBrands, selectedAttrValues, minPrice, maxPrice, inStockOnly, sort]);

  function toggleBrand(id) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAttrValue(id) {
    setSelectedAttrValues((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearAll() {
    setSelectedBrands(new Set());
    setSelectedAttrValues(new Set());
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSort('default');
  }

  const hasActiveFilters = selectedBrands.size > 0 || selectedAttrValues.size > 0 || minPrice || maxPrice || inStockOnly;

  return (
    <div>
      {breadcrumb && (
        <div className="breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <span key={i}>
              {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              {i < breadcrumb.length - 1 && ' > '}
            </span>
          ))}
        </div>
      )}

      {title && <h1 style={{ marginTop: 0 }}>{title}</h1>}

      <div className="filter-bar">
        <div className="filter-bar__left">
          <FilterDropdown
            label={t('filters.brand')}
            options={brandOptions}
            selected={selectedBrands}
            onToggle={toggleBrand}
          />
          {attributeGroupOptions.map((group) => (
            <FilterDropdown
              key={group.attributeId}
              label={i18n.language === 'ar' ? group.nameAr : group.nameEn}
              options={group.values.map((v) => ({
                id: v.id,
                label: i18n.language === 'ar' ? v.value_ar : v.value_en,
                swatch: v.hex_code || undefined,
              }))}
              selected={selectedAttrValues}
              onToggle={toggleAttrValue}
            />
          ))}
          <div className="filter-dropdown">
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="number"
                placeholder={t('filters.min')}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ width: 80, padding: '9px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              />
              <input
                type="number"
                placeholder={t('filters.max')}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: 80, padding: '9px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            {t('filters.in_stock')}
          </label>
          {hasActiveFilters && (
            <button type="button" className="btn btn-outline btn-sm" onClick={clearAll}>
              {t('filters.clear_all')}
            </button>
          )}
        </div>

        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <option value="default">{t('filters.sort_default')}</option>
          <option value="newest">{t('filters.sort_newest')}</option>
          <option value="deals">{t('filters.sort_deals')}</option>
          <option value="price_asc">{t('filters.sort_price_asc')}</option>
          <option value="price_desc">{t('filters.sort_price_desc')}</option>
        </select>
      </div>

      <div className="results-meta">
        <span>{t('filters.showing_products', { count: filtered.length })}</span>
      </div>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>{t('filters.no_products')}</p>}

      {!loading && !error && filtered.length > 0 && (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
