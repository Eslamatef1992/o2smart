import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

export default function ProductsList() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/products');
      setProducts(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/products/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t('nav.products')}</h1>
        <Link to="/products/new" className="btn btn-primary">
          {t('common.add_new')}
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : products.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>{t('common.name_en')}</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt=""
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{p.name_en}</td>
                  <td>{p.category_name_en || '—'}</td>
                  <td>{p.sku}</td>
                  <td>
                    {p.sale_price ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', marginInlineEnd: 6 }}>
                          {p.price}
                        </span>
                        <span>{p.sale_price}</span>
                      </>
                    ) : (
                      p.price
                    )}{' '}
                    KWD
                  </td>
                  <td>{p.stock_quantity}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {p.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/products/${p.id}/edit`} className="btn btn-outline btn-sm">
                        {t('common.edit')}
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
