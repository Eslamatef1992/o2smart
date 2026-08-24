import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMPTY = { slug: '', titleEn: '', titleAr: '', contentEn: '', contentAr: '', isActive: true };

export default function CmsPageForm({ initial, onCancel, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>{initial ? t('common.edit') : t('common.add_new')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>{t('common.slug')}</label>
            <input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              required
              disabled={!!initial}
            />
          </div>
          <div className="form-field">
            <label>Title (English)</label>
            <input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Title (Arabic)</label>
            <input value={form.titleAr} onChange={(e) => set('titleAr', e.target.value)} required dir="rtl" />
          </div>
          <div className="form-field">
            <label>Content (English)</label>
            <textarea rows={8} value={form.contentEn || ''} onChange={(e) => set('contentEn', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Content (Arabic)</label>
            <textarea
              rows={8}
              dir="rtl"
              value={form.contentAr || ''}
              onChange={(e) => set('contentAr', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                style={{ width: 'auto' }}
              />
              {t('common.active')}
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
