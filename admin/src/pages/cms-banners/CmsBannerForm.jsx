import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageUploadField from '../../components/ImageUploadField';

const EMPTY = {
  titleEn: '',
  titleAr: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  isActive: true,
  startsAt: '',
  endsAt: '',
};

// DB values come back as "YYYY-MM-DD HH:MM:SS" (or null); <input type="datetime-local">
// needs "YYYY-MM-DDTHH:MM".
function toInputValue(value) {
  if (!value) return '';
  return String(value).replace(' ', 'T').slice(0, 16);
}

// Convert back to a MySQL-friendly "YYYY-MM-DD HH:MM:SS", or null when cleared.
function toDbValue(value) {
  if (!value) return null;
  return `${value.replace('T', ' ')}:00`;
}

export default function CmsBannerForm({ initial, onCancel, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...initial,
    startsAt: toInputValue(initial?.startsAt),
    endsAt: toInputValue(initial?.endsAt),
  }));
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
      await onSubmit({
        ...form,
        startsAt: toDbValue(form.startsAt),
        endsAt: toDbValue(form.endsAt),
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
        <h2 style={{ marginTop: 0 }}>{initial ? t('common.edit') : t('common.add_new')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Title (English)</label>
            <input value={form.titleEn || ''} onChange={(e) => set('titleEn', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Title (Arabic)</label>
            <input value={form.titleAr || ''} onChange={(e) => set('titleAr', e.target.value)} dir="rtl" />
          </div>
          <ImageUploadField label="Image" value={form.imageUrl} onChange={(url) => set('imageUrl', url)} required />
          <div className="form-field">
            <label>Link URL</label>
            <input value={form.linkUrl || ''} onChange={(e) => set('linkUrl', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </div>
          <div className="form-field">
            <label>Starts At</label>
            <input
              type="datetime-local"
              value={form.startsAt || ''}
              onChange={(e) => set('startsAt', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Ends At</label>
            <input
              type="datetime-local"
              value={form.endsAt || ''}
              onChange={(e) => set('endsAt', e.target.value)}
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
