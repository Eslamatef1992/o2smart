import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// No customer login exists yet, so the cart is a per-browser localStorage
// cart (guest checkout) — matches build-spec.md's "COD/guest checkout first"
// phase. Each line is keyed by productId+variantId so the same product with
// two different variants gets two separate lines.
const STORAGE_KEY = 'o2smart_cart_v1';
const CartContext = createContext(null);

function lineKey(productId, variantId) {
  return `${productId}:${variantId || 0}`;
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage can be unavailable (private mode) — cart still works for
      // the current page load via in-memory state.
    }
  }, [lines]);

  const addItem = useCallback((item, quantity = 1) => {
    setLines((prev) => {
      const key = lineKey(item.productId, item.variantId);
      const existing = prev.find((l) => lineKey(l.productId, l.variantId) === key);
      const maxQty = item.maxStock ?? Infinity;
      if (existing) {
        return prev.map((l) =>
          lineKey(l.productId, l.variantId) === key
            ? { ...l, quantity: Math.min(maxQty, l.quantity + quantity) }
            : l
        );
      }
      return [...prev, { ...item, quantity: Math.min(maxQty, quantity) }];
    });
    setDrawerOpen(true);
  }, []);

  const updateQuantity = useCallback((productId, variantId, quantity) => {
    setLines((prev) =>
      prev
        .map((l) =>
          lineKey(l.productId, l.variantId) === lineKey(productId, variantId)
            ? { ...l, quantity: Math.max(1, Math.min(l.maxStock ?? Infinity, quantity)) }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId, variantId) => {
    setLines((prev) => prev.filter((l) => lineKey(l.productId, l.variantId) !== lineKey(productId, variantId)));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + Number(l.price) * l.quantity, 0), [lines]);

  const value = useMemo(
    () => ({
      lines,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [lines, count, subtotal, addItem, updateQuantity, removeItem, clearCart, drawerOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
