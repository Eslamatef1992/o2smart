import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setLanguage } from '../i18n';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!loading && admin) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('login.error_generic'));
    } finally {
      setSubmitting(false);
    }
  }

  const nextLang = i18n.language === 'ar' ? 'en' : 'ar';

  return (
    <div className="login-screen">
      <div className="card login-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setLanguage(nextLang)}>
            {nextLang === 'ar' ? 'عربي' : 'EN'}
          </button>
        </div>
        <h1>{t('login.title')}</h1>
        <p>{t('login.subtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">{t('login.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">{t('login.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
