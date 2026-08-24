import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function StockAdjustForm({ row, onCancel, onSubmit }) {
  const { t } = useTranslation();
  const [changeQuantity, setChangeQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!changeQuantity || Number(changeQuantity) === 0) {
      setError('Enter a non-zero quantity (positive to add stock, negative to deduct).');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        productId: row.product_id,
        variantId: row.variant_id || null,
        changeQuantity: Number(changeQuantity),
        reason,
      });
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Adjust Stock</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {row.name_en} {row.sku ? `(${row.sku})` : ''} — current quantity: <strong>{row.quantity}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Change Quantity (use a negative number to deduct)</label>
            <input
              type="number"
              value={changeQuantity}
              onChange={(e) => setChangeQuantity(e.target.value)}
              placeholder="e.g. 10 or -5"
              autoFocus
            />
          </div>
          <div className="form-field">
            <label>Reason (optional)</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. New shipment, damaged, correction" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t('common.saving') : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
