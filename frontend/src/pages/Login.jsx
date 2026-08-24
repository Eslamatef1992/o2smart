import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Passwordless flow per Figma: email -> OTP, plus "Continue with Google".
// Actual /auth/request-otp + /auth/google endpoints land with the auth module.
export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate(`/otp?email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1>{t('auth.login_title')}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>{t('auth.login_subtitle')}</p>
      <label htmlFor="email">{t('auth.email')}</label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: 'var(--space-2)', margin: 'var(--space-2) 0' }}
      />
      <button type="submit" className="btn-primary" style={{ width: '100%' }}>{t('auth.confirm')}</button>
      <div style={{ textAlign: 'center', margin: 'var(--space-3) 0' }}>OR</div>
      <button type="button" className="btn-outline" style={{ width: '100%' }}>{t('auth.continue_with_google')}</button>
    </form>
  );
}
