import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { setLanguage } from '../i18n';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title }) {
  const { t, i18n } = useTranslation();
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const nextLang = i18n.language === 'ar' ? 'en' : 'ar';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__title">{title}</div>
      <div className="admin-topbar__actions">
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {admin?.name} · {admin?.role_name || admin?.role}
        </span>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setLanguage(nextLang)}>
          {nextLang === 'ar' ? 'عربي' : 'EN'}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
          {t('common.logout')}
        </button>
      </div>
    </header>
  );
}
