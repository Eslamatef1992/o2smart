import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from './icons';
import { formatKwd } from '../utils/product';

export default function CartDrawer() {
  const { t, i18n } = useTranslation();
  const { lines, subtotal, drawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();

  if (!drawerOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={closeDrawer} />
      <div className="drawer">
        <div className="drawer__header">
          <strong>{t('cart.title')}</strong>
          <button type="button" className="btn-icon" onClick={closeDrawer} aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        <div className="drawer__body">
          {lines.length === 0 ? (
            <div className="empty-cart">
              <p>{t('cart.empty')}</p>
              <button type="button" className="btn btn-primary" onClick={closeDrawer}>
                {t('cart.continue_shopping')}
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div className="cart-line" key={`${line.productId}:${line.variantId || 0}`}>
                <img src={line.image || undefined} alt="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{i18n.language === 'ar' ? line.nameAr : line.nameEn}</div>
                  {line.variantLabel && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{line.variantLabel}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <div className="qty-stepper">
                      <button type="button" onClick={() => updateQuantity(line.productId, line.variantId, line.quantity - 1)}>
                        <MinusIcon width={14} height={14} />
                      </button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(line.productId, line.variantId, line.quantity + 1)}>
                        <PlusIcon width={14} height={14} />
                      </button>
                    </div>
                    <strong style={{ fontSize: '0.85rem' }}>{formatKwd(line.price * line.quantity)} {t('common.kwd')}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  style={{ color: 'var(--accent-red)', alignSelf: 'flex-start' }}
                  onClick={() => removeItem(line.productId, line.variantId)}
                  aria-label={t('cart.remove')}
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer__footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              <span>{t('checkout.total')}</span>
              <span>{formatKwd(subtotal)} {t('common.kwd')}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/cart" className="btn btn-outline btn-block" onClick={closeDrawer}>
                {t('cart.view_cart')}
              </Link>
              <Link to="/checkout" className="btn btn-primary btn-block" onClick={closeDrawer}>
                {t('cart.checkout')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
