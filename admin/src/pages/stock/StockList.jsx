import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import StockAdjustForm from './StockAdjustForm';

export default function StockList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjusting, setAdjusting] = useState(null); // row being adjusted
  const [showLowOnly, setShowLowOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/stock');
      setRows(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdjust(payload) {
    await apiClient.post('/stock/adjust', payload);
    setAdjusting(null);
    await load();
  }

  const visibleRows = showLowOnly ? rows.filter((r) => r.is_low_stock) : rows;

  return (
    <div>
      <div className="page-header">
        <h1>{t('nav.stock')}</h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={showLowOnly} onChange={(e) => setShowLowOnly(e.target.checked)} />
          Show low stock only
        </label>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : visibleRows.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('common.name_en')}</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => (
                <tr key={`${r.type}-${r.product_id}-${r.variant_id || 0}`}>
                  <td>{r.name_en}</td>
                  <td>{r.sku}</td>
                  <td>{r.type === 'variant' ? 'Variant' : 'Product'}</td>
                  <td>{r.quantity}</td>
                  <td>
                    <span className={`badge ${r.is_low_stock ? 'badge-inactive' : 'badge-active'}`}>
                      {r.is_low_stock ? 'Low Stock' : 'OK'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setAdjusting(r)}>
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {adjusting && <StockAdjustForm row={adjusting} onCancel={() => setAdjusting(null)} onSubmit={handleAdjust} />}
    </div>
  );
}
