import OrderForm from '../orders/OrderForm';

export default function GuestOrderForm() {
  return <OrderForm basePath="/guest-orders" backLabelKey="nav.guestOrders" />;
}
