import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import {
  localizedName,
  groupVariantAttributes,
  findVariantByValues,
  effectivePricing,
  discountPercent,
  stockState,
  formatKwd,
} from '../utils/product';

// Product card used on the home page rails, category/search grids, and
// "you may also like" carousels. When a product has variants (e.g.
// Storage + Color), it renders the same quick-select controls shown in the
// reference design so shoppers can pick a combination without opening the
// product page.
export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const groups = useMemo(() => groupVariantAttributes(product.variants), [product.variants]);
  const [selected, setSelected] = useState({});

  const selectedValueIds = groups.map((g) => selected[g.attributeId]).filter(Boolean);
  const activeVariant =
    groups.length > 0 && selectedValueIds.length === groups.length
      ? findVariantByValues(product.variants, selectedValueIds)
      : undefined;

  const { price, salePrice, stock } = effectivePricing(product, activeVariant);
  const pct = discountPercent(price, salePrice);
  const state = stockState(stock);
  const name = localizedName(product, i18n.language);
  const canAddToCart = groups.length === 0 || !!activeVariant;

  function pick(attributeId, valueId) {
    setSelected((prev) => ({ ...prev, [attributeId]: prev[attributeId] === valueId ? undefined : valueId }));
  }

  function handleAddToCart(e) {
    e.preventDefault();
    if (!canAddToCart || state === 'out') return;
    addItem({
      productId: product.id,
      variantId: activeVariant ? activeVariant.id : null,
      nameEn: product.name_en,
      nameAr: product.name_ar,
      variantLabel: activeVariant ? (activeVariant.attributeValues || []).map((av) => (i18n.language === 'ar' ? av.value_ar : av.value_en)).join(' / ') : undefined,
      image: product.thumbnail_url,
      price: salePrice ?? price,
      maxStock: stock,
    });
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__media">
        {product.thumbnail_url && <img src={product.thumbnail_url} alt={name} loading="lazy" />}
        <div className="product-card__badges">
          {pct && <span className="badge badge-discount">-{pct}%</span>}
        </div>
      </Link>

      <div className="product-card__body">
        <Link to={`/product/${product.id}`} className="product-card__title">
          {name}
        </Link>

        <div className="product-card__price">
          {salePrice ? (
            <>
              <span>{formatKwd(salePrice)} {t('common.kwd')}</span>
              <span className="old">{formatKwd(price)}</span>
              {pct && <span className="pct">-{pct}%</span>}
            </>
          ) : (
            <span>{formatKwd(price)} {t('common.kwd')}</span>
          )}
        </div>

        {groups.map((group) => (
          <div className="variant-row" key={group.attributeId}>
            <span className="label">{i18n.language === 'ar' ? group.nameAr : group.nameEn}:</span>
            {group.values.map((val) =>
              val.hex_code ? (
                <button
                  key={val.id}
                  type="button"
                  className={`color-swatch ${selected[group.attributeId] === val.id ? 'active' : ''}`}
                  style={{ background: val.hex_code }}
                  title={i18n.language === 'ar' ? val.value_ar : val.value_en}
                  onClick={() => pick(group.attributeId, val.id)}
                />
              ) : (
                <button
                  key={val.id}
                  type="button"
                  className={`swatch-btn ${selected[group.attributeId] === val.id ? 'active' : ''}`}
                  onClick={() => pick(group.attributeId, val.id)}
                >
                  {i18n.language === 'ar' ? val.value_ar : val.value_en}
                </button>
              )
            )}
          </div>
        ))}

        <span className={`stock-line stock-${state}`}>
          <span className="stock-dot" />
          {state === 'out' && t('product.out_of_stock')}
          {state === 'low' && t('product.low_stock', { count: stock })}
          {state === 'in' && t('product.in_stock')}
        </span>

        <div className="product-card__footer">
          <button type="button" className="btn btn-primary btn-block btn-sm" disabled={!canAddToCart || state === 'out'} onClick={handleAddToCart}>
            {t('product.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
