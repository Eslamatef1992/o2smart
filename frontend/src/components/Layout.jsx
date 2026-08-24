import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <Header />
      <main className="container" style={{ minHeight: '60vh', paddingBlock: 'var(--space-4)' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
