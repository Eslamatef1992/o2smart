import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import CmsBannerForm from './CmsBannerForm';

export default function CmsBannersList() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/cms-banners');
      setBanners(data.data);
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
      await apiClient.put(`/cms-banners/${editing.id}`, form);
    } else {
      await apiClient.post('/cms-banners', form);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/cms-banners/${id}`);
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
        <h1>{t('nav.cmsBanners')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : banners.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>{t('common.name_en')}</th>
                <th>Link</th>
                <th>Sort Order</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.image_url ? (
                      <img
                        src={b.image_url}
                        alt=""
                        style={{ width: 60, height: 36, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{b.title_en}</td>
                  <td>{b.link_url}</td>
                  <td>{b.sort_order}</td>
                  <td>
                    <span className={`badge ${b.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {b.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setEditing({
                            id: b.id,
                            titleEn: b.title_en,
                            titleAr: b.title_ar,
                            imageUrl: b.image_url,
                            linkUrl: b.link_url,
                            sortOrder: b.sort_order,
                            isActive: !!b.is_active,
                            startsAt: b.starts_at,
                            endsAt: b.ends_at,
                          })
                        }
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === b.id}
                        onClick={() => handleDelete(b.id)}
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
        <CmsBannerForm initial={editing.id ? editing : null} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </div>
  );
}
