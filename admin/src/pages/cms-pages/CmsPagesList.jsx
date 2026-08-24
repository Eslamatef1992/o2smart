import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import CmsPageForm from './CmsPageForm';

export default function CmsPagesList() {
  const { t } = useTranslation();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/cms-pages');
      setPages(data.data);
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
      await apiClient.put(`/cms-pages/${editing.id}`, form);
    } else {
      await apiClient.post('/cms-pages', form);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/cms-pages/${id}`);
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
        <h1>{t('nav.cmsPages')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : pages.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('common.slug')}</th>
                <th>Title (English)</th>
                <th>Title (Arabic)</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id}>
                  <td>{p.slug}</td>
                  <td>{p.title_en}</td>
                  <td dir="rtl">{p.title_ar}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {p.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setEditing({
                            id: p.id,
                            slug: p.slug,
                            titleEn: p.title_en,
                            titleAr: p.title_ar,
                            contentEn: p.content_en,
                            contentAr: p.content_ar,
                            isActive: !!p.is_active,
                          })
                        }
                      >
                        {t('common.edit')}
                      </button>
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

      {editing !== null && (
        <CmsPageForm initial={editing.id ? editing : null} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </div>
  );
}
