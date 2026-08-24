import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

const EMPTY = { name: '', email: '', roleId: '', isActive: true };

export default function AdminForm({ initial, onCancel, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadRoles() {
      try {
        const { data } = await apiClient.get('/roles');
        if (!cancelled) setRoles(data.data);
      } catch {
        // roles dropdown just stays empty on failure; save will surface its own error
      }
    }
    loadRoles();
    return () => {
      cancelled = true;
    };
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        roleId: form.roleId,
        isActive: form.isActive,
        ...(password ? { password } : {}),
      };
      await onSubmit(payload);
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
            <label>Name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>{initial ? 'New Password (leave blank to keep unchanged)' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!initial}
            />
          </div>
          <div className="form-field">
            <label>Role</label>
            <select value={form.roleId} onChange={(e) => set('roleId', e.target.value)} required>
              <option value="" disabled>
                Select a role
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name_en} ({role.name})
                </option>
              ))}
            </select>
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
