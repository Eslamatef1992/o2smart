import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';

// First real wiring: fetches categories from the Express/MySQL API to prove
// the full stack is connected end to end. Replace the placeholder sections
// below with real product grids as the products module gets built.
export default function Home() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get('/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>{t('nav.categories')}</h1>

      {error && (
        <p style={{ color: 'var(--accent-red)' }}>
          Could not load categories from the API: {error}
        </p>
      )}

      {!error && categories.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No categories yet — add some via the admin panel (or POST /api/categories) once it exists.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {categories.map((c) => (
          <div key={c.id} className="card">
            {c.name_en} / {c.name_ar}
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 'var(--space-5)' }}>{t('nav.top_deals')}</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>Product grid goes here once the products module is built.</p>
    </div>
  );
}
