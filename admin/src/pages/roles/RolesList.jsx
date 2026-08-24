import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import RoleForm from './RoleForm';

export default function RolesList() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/roles');
      setRoles(data.data);
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
      await apiClient.put(`/roles/${editing.id}`, form);
    } else {
      await apiClient.post('/roles', form);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/roles/${id}`);
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
        <h1>{t('nav.roles')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : roles.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>{t('common.name_en')}</th>
                <th>{t('common.name_ar')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>
                    <code>{r.name}</code>
                  </td>
                  <td>{r.name_en}</td>
                  <td dir="rtl">{r.name_ar}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setEditing({
                            id: r.id,
                            name: r.name,
                            nameEn: r.name_en,
                            nameAr: r.name_ar,
                          })
                        }
                      >
                        {t('common.edit')}
                      </button>
                      {r.name !== 'super_admin' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={deletingId === r.id}
                          onClick={() => handleDelete(r.id)}
                        >
                          {t('common.delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== null && (
        <RoleForm initial={editing.id ? editing : null} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </div>
  );
}
