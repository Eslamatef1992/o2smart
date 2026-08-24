import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PATH_TO_NAV_KEY = {
  '/': 'dashboard',
  '/categories': 'categories',
  '/subcategories': 'subcategories',
  '/products': 'products',
  '/brands': 'brands',
  '/attributes': 'attributes',
  '/stock': 'stock',
  '/orders': 'orders',
  '/guest-orders': 'guestOrders',
  '/payment-links': 'paymentLinks',
  '/promo-codes': 'promoCodes',
  '/reviews': 'reviews',
  '/cms-pages': 'cmsPages',
  '/cms-banners': 'cmsBanners',
  '/settings': 'settings',
  '/roles': 'roles',
  '/admins': 'admins',
};

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navKey = PATH_TO_NAV_KEY[location.pathname] || 'dashboard';

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Topbar title={t(`nav.${navKey}`)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
