import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import AttributeForm from './AttributeForm';

export default function AttributesList() {
  const { t } = useTranslation();
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/attributes');
      setAttributes(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(form) {
    if (editing && editing.id) {
      await apiClient.put(`/attributes/${editing.id}`, form);
    } else {
      await apiClient.post('/attributes', form);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/attributes/${id}`);
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
        <h1>{t('nav.attributes')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : attributes.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('common.name_en')}</th>
                <th>{t('common.name_ar')}</th>
                <th>Key</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((a) => (
                <tr key={a.id}>
                  <td>{a.name_en}</td>
                  <td dir="rtl">{a.name_ar}</td>
                  <td>{a.key_name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/attributes/${a.id}/values`} className="btn btn-outline btn-sm">
                        Values
                      </Link>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setEditing({
                            id: a.id,
                            nameEn: a.name_en,
                            nameAr: a.name_ar,
                            keyName: a.key_name,
                          })
                        }
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === a.id}
                        onClick={() => handleDelete(a.id)}
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
        <AttributeForm initial={editing.id ? editing : null} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </div>
  );
}
