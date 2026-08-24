import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { MinusIcon, PlusIcon } from '../components/icons';
import {
  localizedName,
  groupVariantAttributes,
  findVariantByValues,
  effectivePricing,
  discountPercent,
  stockState,
  formatKwd,
} from '../utils/product';
import { getRecentlyViewedIds, pushRecentlyViewed, clearRecentlyViewed } from '../utils/recentlyViewed';

export default function ProductDetails() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(undefined); // undefined = loading, null = not found
  const [selected, setSelected] = useState({});
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentTick, setRecentTick] = useState(0);

  useEffect(() => {
    setProduct(undefined);
    setSelected({});
    setActiveImage(0);
    setQuantity(1);
    apiClient
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data.data);
        pushRecentlyViewed(Number(id));
      })
      .catch(() => setProduct(null));
  }, [id]);

  useEffect(() => {
    if (!product) return;
    apiClient
      .get(`/products?activeOnly=true&categoryId=${product.category_id}&limit=5`)
      .then((res) => setRelated(res.data.data.filter((p) => p.id !== product.id)))
      .catch(() => setRelated([]));
  }, [product]);

  useEffect(() => {
    const ids = getRecentlyViewedIds().filter((rid) => rid !== Number(id));
    if (ids.length === 0) {
      setRecentlyViewed([]);
      return;
    }
    Promise.all(ids.map((rid) => apiClient.get(`/products/${rid}`).then((res) => res.data.data).catch(() => null)))
      .then((results) => setRecentlyViewed(results.filter(Boolean)));
  }, [id, recentTick]);

  const groups = useMemo(() => (product ? groupVariantAttributes(product.variants) : []), [product]);
  const selectedValueIds = groups.map((g) => selected[g.attributeId]).filter(Boolean);
  const activeVariant =
    product && groups.length > 0 && selectedValueIds.length === groups.length
      ? findVariantByValues(product.variants, selectedValueIds)
      : undefined;

  if (product === undefined) return <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>;
  if (product === null) return <p style={{ color: 'var(--color-text-muted)' }}>{t('product.not_found')}</p>;

  const { price, salePrice, stock, sku } = effectivePricing(product, activeVariant);
  const pct = discountPercent(price, salePrice);
  const state = stockState(stock);
  const name = localizedName(product, i18n.language);
  const canAddToCart = groups.length === 0 || !!activeVariant;
  const images = product.images && product.images.length > 0 ? product.images : [{ image_url: product.thumbnail_url }];

  function pick(attributeId, valueId) {
    setSelected((prev) => ({ ...prev, [attributeId]: prev[attributeId] === valueId ? undefined : valueId }));
  }

  function buildCartItem() {
    return {
      productId: product.id,
      variantId: activeVariant ? activeVariant.id : null,
      nameEn: product.name_en,
      nameAr: product.name_ar,
      variantLabel: activeVariant
        ? (activeVariant.attributeValues || []).map((av) => (i18n.language === 'ar' ? av.value_ar : av.value_en)).join(' / ')
        : undefined,
      image: images[0]?.image_url,
      price: salePrice ?? price,
      maxStock: stock,
    };
  }

  function handleAddToCart() {
    if (!canAddToCart || state === 'out') return;
    addItem(buildCartItem(), quantity);
  }

  function handleBuyNow() {
    if (!canAddToCart || state === 'out') return;
    addItem(buildCartItem(), quantity);
    navigate('/checkout');
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">{t('common.home')}</Link> {'>'}{' '}
        {product.category_name_en && <Link to={`/category/${product.category_slug || ''}`}>{product.category_name_en}</Link>} {'>'} {name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr 1fr', gap: 'var(--space-3)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImage(i)}
              style={{
                border: i === activeImage ? '2px solid var(--white-950)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 0,
                overflow: 'hidden',
                background: 'var(--white-100)',
              }}
            >
              {img.image_url && <img src={img.image_url} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          {pct && <span className="badge badge-discount" style={{ position: 'absolute', top: 12, insetInlineStart: 12 }}>-{pct}%</span>}
          {images[activeImage]?.image_url && (
            <img src={images[activeImage].image_url} alt={name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
          )}
        </div>

        <div>
          <h1 style={{ marginTop: 0, marginBottom: 6 }}>{name}</h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: '1.4rem', fontWeight: 700 }}>
            {salePrice ? (
              <>
                <span>{formatKwd(salePrice)} {t('common.kwd')}</span>
                <span style={{ fontSize: '1rem', fontWeight: 400, textDecoration: 'line-through', color: 'var(--white-400)' }}>{formatKwd(price)}</span>
              </>
            ) : (
              <span>{formatKwd(price)} {t('common.kwd')}</span>
            )}
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('product.sku')}: {sku}</p>

          {groups.map((group) => (
            <div className="variant-row" key={group.attributeId} style={{ marginBottom: 'var(--space-2)' }}>
              <span className="label">{t('product.select_option', { name: i18n.language === 'ar' ? group.nameAr : group.nameEn })}</span>
              {group.values.map((val) =>
                val.hex_code ? (
                  <button
                    key={val.id}
                    type="button"
                    className={`color-swatch ${selected[group.attributeId] === val.id ? 'active' : ''}`}
                    style={{ background: val.hex_code, width: 28, height: 28 }}
                    title={i18n.language === 'ar' ? val.value_ar : val.value_en}
                    onClick={() => pick(group.attributeId, val.id)}
                  />
                ) : (
                  <button
                    key={val.id}
                    type="button"
                    className={`swatch-btn ${selected[group.attributeId] === val.id ? 'active' : ''}`}
                    style={{ padding: '8px 14px' }}
                    onClick={() => pick(group.attributeId, val.id)}
                  >
                    {i18n.language === 'ar' ? val.value_ar : val.value_en}
                  </button>
                )
              )}
            </div>
          ))}

          <span className={`stock-line stock-${state}`} style={{ marginBottom: 'var(--space-3)' }}>
            <span className="stock-dot" />
            {state === 'out' && t('product.out_of_stock')}
            {state === 'low' && t('product.low_stock', { count: stock })}
            {state === 'in' && t('product.in_stock')}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div className="qty-stepper">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <MinusIcon width={14} height={14} />
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}>
                <PlusIcon width={14} height={14} />
              </button>
            </div>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={!canAddToCart || state === 'out'} onClick={handleAddToCart}>
              {t('product.add_to_cart')}
            </button>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-block"
            disabled={!canAddToCart || state === 'out'}
            onClick={handleBuyNow}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            {t('product.buy_now')}
          </button>

          {product.description_en && (
            <div className="card" style={{ marginBottom: 'var(--space-2)' }}>
              <strong>{t('product.more_details')}</strong>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {i18n.language === 'ar' && product.description_ar ? product.description_ar : product.description_en}
              </p>
            </div>
          )}

          <div className="card" style={{ marginBottom: 'var(--space-2)' }}>
            <strong>{t('product.why_this_product')}</strong>
            <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.8, paddingInlineStart: 20, margin: '8px 0 0' }}>
              <li>{t('product.trust_warranty')}</li>
              <li>{t('product.trust_delivery')}</li>
              <li>{t('product.trust_returns')}</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-title"><h2>{t('product.you_may_also_like')}</h2></div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="section">
          <div className="section-title">
            <h2>{t('product.recently_viewed')}</h2>
            <button
              type="button"
              className="view-all"
              onClick={() => {
                clearRecentlyViewed();
                setRecentTick((n) => n + 1);
              }}
            >
              {t('product.clear_history')}
            </button>
          </div>
          <div className="product-grid">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
