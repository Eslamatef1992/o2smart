// Tracks the last few viewed product ids per browser (localStorage) — powers
// the "Recently Viewed Products" rail on the product detail page. No account
// system exists yet, so this intentionally doesn't sync across devices.
const STORAGE_KEY = 'o2smart_recently_viewed_v1';
const MAX_ITEMS = 8;

export function getRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushRecentlyViewed(productId) {
  try {
    const ids = getRecentlyViewedIds().filter((id) => id !== productId);
    ids.unshift(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  } catch {
    // ignore — storage unavailable
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
