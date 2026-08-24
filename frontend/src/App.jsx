import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
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
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/about" element={<StaticPage title="About" />} />
        <Route path="/privacy-policy" element={<StaticPage title="Privacy Policy" />} />
        <Route path="/refund-policy" element={<StaticPage title="Refund Policy" />} />
        <Route path="/terms" element={<StaticPage title="Terms & Conditions" />} />
        <Route path="/contact-us" element={<StaticPage title="Contact Us" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
