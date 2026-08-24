import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlaceholderModule from './pages/PlaceholderModule';
import CategoriesList from './pages/categories/CategoriesList';

// Every module besides categories is a placeholder for now — swap each in
// for a real page (following the categories folder as the pattern) as it
// gets built, per build-spec.md §11.
const PLACEHOLDER_ROUTES = [
  { path: '/subcategories', key: 'subcategories' },
  { path: '/products', key: 'products' },
  { path: '/brands', key: 'brands' },
  { path: '/attributes', key: 'attributes' },
  { path: '/stock', key: 'stock' },
  { path: '/orders', key: 'orders' },
  { path: '/guest-orders', key: 'guestOrders' },
  { path: '/payment-links', key: 'paymentLinks' },
  { path: '/promo-codes', key: 'promoCodes' },
  { path: '/reviews', key: 'reviews' },
  { path: '/cms-pages', key: 'cmsPages' },
  { path: '/cms-banners', key: 'cmsBanners' },
  { path: '/settings', key: 'settings' },
  { path: '/roles', key: 'roles' },
  { path: '/admins', key: 'admins' },
];

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<CategoriesList />} />
            {PLACEHOLDER_ROUTES.map((r) => (
              <Route key={r.path} path={r.path} element={<PlaceholderModule titleKey={r.key} />} />
            ))}
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
