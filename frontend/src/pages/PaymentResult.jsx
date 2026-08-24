import { useSearchParams } from 'react-router-dom';

export function PaymentSuccess() {
  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--accent-green)' }}>Payment Successful!</h1>
      <p>Your order has been successfully placed and is being prepared for shipping.</p>
    </div>
  );
}

export function PaymentFailed() {
  const [params] = useSearchParams();
  const reason = params.get('reason') || 'card'; // 'card' | 'network'
  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--accent-red)' }}>Payment Failed</h1>
      <p>{reason === 'network' ? 'A network error occurred.' : 'Your card was declined.'}</p>
    </div>
  );
}
