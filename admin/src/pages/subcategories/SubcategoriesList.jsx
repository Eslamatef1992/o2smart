import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import SubcategoryForm from './SubcategoryForm';

export default function SubcategoriesList() {
  const { t } = useTranslation();
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...row} = edit
  const [deletingId, setDeletingId] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/categories');
      setCategories(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    }
  }, [t]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/subcategories', {
        params: categoryFilter ? { categoryId: categoryFilter } : {},
      });
      setSubcategories(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setLoading(false);
    }
  }, [t, categoryFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    load();
  }, [load]);

  function categoryName(categoryId) {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name_en : '';
  }

  async function handleSave(form) {
    if (editing && editing.id) {
      await apiClient.put(`/subcategories/${editing.id}`, form);
    } else {
      await apiClient.post('/subcategories', form);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/subcategories/${id}`);
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
        <h1>{t('nav.subcategories')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          {t('common.add_new')}
        </button>
      </div>

      <div className="form-field" style={{ maxWidth: 280, marginBottom: 'var(--space-3)' }}>
        <label>Category</label>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_en}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : error ? (
          <div className="empty-state form-error">{error}</div>
        ) : subcategories.length === 0 ? (
          <div className="empty-state">{t('common.no_records')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>{t('common.name_en')}</th>
                <th>{t('common.name_ar')}</th>
                <th>{t('common.slug')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((s) => (
                <tr key={s.id}>
                  <td>{categoryName(s.category_id)}</td>
                  <td>{s.name_en}</td>
                  <td dir="rtl">{s.name_ar}</td>
                  <td>{s.slug}</td>
                  <td>
                    <span className={`badge ${s.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {s.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setEditing({
                            id: s.id,
                            categoryId: s.category_id,
                            nameEn: s.name_en,
                            nameAr: s.name_ar,
                            slug: s.slug,
                            imageUrl: s.image_url,
                            sortOrder: s.sort_order,
                            isActive: !!s.is_active,
                          })
                        }
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === s.id}
                        onClick={() => handleDelete(s.id)}
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
        <SubcategoryForm initial={editing.id ? editing : null} onCancel={() => setEditing(null)} onSubmit={handleSave} />
      )}
    </div>
  );
}
