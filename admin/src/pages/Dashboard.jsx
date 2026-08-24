import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { t } = useTranslation();
  const { admin } = useAuth();
  const [categoryCount, setCategoryCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/categories')
      .then(({ data }) => {
        if (!cancelled) setCategoryCount(data.data.length);
      })
      .catch(() => {
        if (!cancelled) setCategoryCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>
          {t('dashboard.welcome')}, {admin?.name}
        </h1>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-card__label">Categories</div>
          <div className="kpi-card__value">{categoryCount ?? '—'}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-card__label">{t('dashboard.total_products')}</div>
          <div className="kpi-card__value">—</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-card__label">{t('dashboard.orders_today')}</div>
          <div className="kpi-card__value">—</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-card__label">{t('dashboard.revenue_today')}</div>
          <div className="kpi-card__value">—</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-card__label">{t('dashboard.low_stock')}</div>
          <div className="kpi-card__value">—</div>
        </div>
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 'var(--space-4)' }}>
        Orders, products and stock KPIs will populate here once those modules are built —
        showing "—" rather than fake numbers in the meantime.
      </p>
    </div>
  );
}
