import OrdersList from '../orders/OrdersList';

// Guest orders reuse the Orders backend and UI entirely — the only
// difference is the guest=true filter (user_id IS NULL) and separate nav
// label/paths so admins can tell the two lists apart.
export default function GuestOrdersList() {
  return <OrdersList guest basePath="/guest-orders" titleKey="nav.guestOrders" />;
}
