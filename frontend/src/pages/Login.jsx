import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Passwordless flow per Figma: email -> OTP, plus "Continue with Google".
// Actual /auth/request-otp + /auth/google endpoints land with the auth module.
export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [newsOffers, setNewsOffers] = useState(true);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate(`/otp?email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>{t('auth.login_title')}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: -8 }}>{t('auth.login_subtitle')}</p>

      <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>
        {t('auth.email')}
      </label>
      <input
        id="email"
        type="email"
        required
        placeholder={t('auth.email_placeholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: 'var(--space-2)', marginBottom: 'var(--space-2)' }}
      />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
        <input type="checkbox" checked={newsOffers} onChange={(e) => setNewsOffers(e.target.checked)} />
        {t('auth.news_offers')}
      </label>

      <button type="submit" className="btn btn-primary btn-block">
        {t('auth.confirm')}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 'var(--space-3) 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        OR
        <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      </div>

      <button type="button" className="btn btn-outline btn-block">
        {t('auth.continue_with_google')}
      </button>
    </form>
  );
}
