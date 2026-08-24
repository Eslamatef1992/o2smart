import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { MinusIcon, PlusIcon, TrashIcon } from '../components/icons';
import { formatKwd } from '../utils/product';

export default function Cart() {
  const { t } = useTranslation();
  const { lines, subtotal, updateQuantity, removeItem } = useCart();
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    apiClient
      .get('/products?activeOnly=true&deals=true&limit=4')
      .then((res) => setRecommended(res.data.data))
      .catch(() => setRecommended([]));
  }, []);

  if (lines.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <h1>{t('cart.empty')}</h1>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 'var(--space-3)' }}>
          {t('cart.continue_shopping')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">{t('common.home')}</Link> {'>'} {t('cart.title')}
      </div>
      <h1 style={{ marginTop: 0 }}>{t('cart.title')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-4)', alignItems: 'start' }}>
        <div className="card" style={{ padding: 0 }}>
          {lines.map((line) => (
            <div
              key={`${line.productId}:${line.variantId || 0}`}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Link to={`/product/${line.productId}`} style={{ flexShrink: 0 }}>
                {line.image ? (
                  <img src={line.image} alt="" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                ) : (
                  <div style={{ width: 84, height: 84, borderRadius: 'var(--radius-md)', background: 'var(--white-100)' }} />
                )}
              </Link>
              <div style={{ flex: 1 }}>
                <Link to={`/product/${line.productId}`} style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {line.nameEn}
                </Link>
                {line.variantLabel && <p style={{ margin: '2px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{line.variantLabel}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <div className="qty-stepper">
                    <button type="button" onClick={() => updateQuantity(line.productId, line.variantId, line.quantity - 1)}>
                      <MinusIcon width={14} height={14} />
                    </button>
                    <span>{line.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(line.productId, line.variantId, line.quantity + 1)}>
                      <PlusIcon width={14} height={14} />
                    </button>
                  </div>
                  <strong>{formatKwd(line.price * line.quantity)} {t('common.kwd')}</strong>
                </div>
              </div>
              <button
                type="button"
                aria-label={t('cart.remove')}
                onClick={() => removeItem(line.productId, line.variantId)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', alignSelf: 'flex-start' }}
              >
                <TrashIcon width={18} height={18} />
              </button>
            </div>
          ))}
        </div>

        <aside className="card">
          <h2 style={{ marginTop: 0 }}>{t('checkout.order_summary')}</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-3)' }}>
            <input type="text" placeholder={t('cart.discount_code')} style={{ flex: 1, padding: 'var(--space-2)' }} disabled title={t('cart.promo_coming_soon')} />
            <button type="button" className="btn btn-outline" disabled title={t('cart.promo_coming_soon')}>
              {t('cart.apply')}
            </button>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: -8 }}>{t('cart.promo_coming_soon')}</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
            <span>{t('checkout.subtotal')}</span>
            <span>{formatKwd(subtotal)} {t('common.kwd')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: 'var(--color-text-muted)' }}>
            <span>{t('checkout.shipping_fees')}</span>
            <span>{t('checkout.enter_address_for_shipping')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <span>{t('checkout.total')}</span>
            <span>{formatKwd(subtotal)} {t('common.kwd')}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary btn-block">
            {t('cart.checkout')}
          </Link>
        </aside>
      </div>

      {recommended.length > 0 && (
        <section className="section">
          <div className="section-title"><h2>{t('cart.you_will_love_this')}</h2></div>
          <div className="product-grid">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
