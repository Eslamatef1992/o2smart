import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import CategoriesList from './pages/categories/CategoriesList';

import SubcategoriesList from './pages/subcategories/SubcategoriesList';

import ProductsList from './pages/products/ProductsList';
import ProductForm from './pages/products/ProductForm';

import BrandsList from './pages/brands/BrandsList';

import AttributesList from './pages/attributes/AttributesList';
import AttributeValuesList from './pages/attributes/AttributeValuesList';

import StockList from './pages/stock/StockList';

import OrdersList from './pages/orders/OrdersList';
import OrderForm from './pages/orders/OrderForm';

import GuestOrdersList from './pages/guest-orders/GuestOrdersList';
import GuestOrderForm from './pages/guest-orders/GuestOrderForm';

import PaymentLinksList from './pages/payment-links/PaymentLinksList';

import PromoCodesList from './pages/promo-codes/PromoCodesList';

import ReviewsList from './pages/reviews/ReviewsList';

import CmsPagesList from './pages/cms-pages/CmsPagesList';

import CmsBannersList from './pages/cms-banners/CmsBannersList';

import SettingsForm from './pages/settings/SettingsForm';

import RolesList from './pages/roles/RolesList';

import AdminsList from './pages/admins/AdminsList';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/categories" element={<CategoriesList />} />

            <Route path="/subcategories" element={<SubcategoriesList />} />

            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />

            <Route path="/brands" element={<BrandsList />} />

            <Route path="/attributes" element={<AttributesList />} />
            <Route path="/attributes/:attributeId/values" element={<AttributeValuesList />} />

            <Route path="/stock" element={<StockList />} />

            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/new" element={<OrderForm />} />
            <Route path="/orders/:id/edit" element={<OrderForm />} />

            <Route path="/guest-orders" element={<GuestOrdersList />} />
            <Route path="/guest-orders/new" element={<GuestOrderForm />} />
            <Route path="/guest-orders/:id/edit" element={<GuestOrderForm />} />

            <Route path="/payment-links" element={<PaymentLinksList />} />

            <Route path="/promo-codes" element={<PromoCodesList />} />

            <Route path="/reviews" element={<ReviewsList />} />

            <Route path="/cms-pages" element={<CmsPagesList />} />

            <Route path="/cms-banners" element={<CmsBannersList />} />

            <Route path="/settings" element={<SettingsForm />} />

            <Route path="/roles" element={<RolesList />} />

            <Route path="/admins" element={<AdminsList />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
