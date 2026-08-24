import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import Search from './pages/Search';
import Brands from './pages/Brands';
import BrandProducts from './pages/BrandProducts';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import { PaymentSuccess, PaymentFailed } from './pages/PaymentResult';
import Login from './pages/Login';
import OtpVerify from './pages/OtpVerify';
import MyAccount from './pages/MyAccount';
import StaticPage from './pages/StaticPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/search" element={<Search />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/brand/:slug" element={<BrandProducts />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/about" element={<StaticPage slug="about" fallbackTitle="About" />} />
        <Route path="/privacy-policy" element={<StaticPage slug="privacy-policy" fallbackTitle="Privacy Policy" />} />
        <Route path="/refund-policy" element={<StaticPage slug="refund-policy" fallbackTitle="Refund Policy" />} />
        <Route path="/terms" element={<StaticPage slug="terms" fallbackTitle="Terms & Conditions" />} />
        <Route path="/contact-us" element={<StaticPage slug="contact-us" fallbackTitle="Contact Us" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
