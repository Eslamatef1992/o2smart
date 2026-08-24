import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import AttributeValueForm from './AttributeValueForm';

export default function AttributeValuesList() {
  const { t } = useTranslation();
  const { attributeId } = useParams();
  const [attribute, setAttribute] = useState(null);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [attrRes, valuesRes] = await Promise.all([
        apiClient.get(`/attributes/${attributeId}`),
        apiClient.get(`/attribute-values?attributeId=${attributeId}`),
      ]);
      setAttribute(attrRes.data.data);
      setValues(valuesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setLoading(false);
    }
  }, [attributeId, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(form) {
    const payload = { ...form, attributeId: Number(attributeId) };
    if (editing && editing.id) {
      await apiClient.put(`/attribute-values/${editing.id}`, payload);
    } else {
      await apiClient.post('/attribute-values', payload);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/attribute-values/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <Link to="/attributes">&larr; Back to Attributes</Link>
      </div>

      <div className="page-header">
        <h1>Values for {attribute ? attribute.name_en : '...'}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : values.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Value (English)</th>
                <th>Value (Arabic)</th>
                <th>Hex Code</th>
                <th>Sort Order</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {values.map((v) => (
                <tr key={v.id}>
                  <td>{v.value_en}</td>
                  <td dir="rtl">{v.value_ar}</td>
                  <td>
                    {v.hex_code ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: '1px solid var(--border, #ccc)',
                            background: v.hex_code,
                          }}
                        />
                        {v.hex_code}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{v.sort_order}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setEditing({
                            id: v.id,
                            valueEn: v.value_en,
                            valueAr: v.value_ar,
                            hexCode: v.hex_code || '',
                            sortOrder: v.sort_order,
                          })
                        }
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === v.id}
                        onClick={() => handleDelete(v.id)}
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

      {editing !== null && (
        <AttributeValueForm
          initial={editing.id ? editing : null}
          attributeId={attributeId}
          onCancel={() => setEditing(null)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}
