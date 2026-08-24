import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function OtpVerify() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const email = params.get('email') || '';

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ marginTop: 0 }}>{t('auth.otp_title')}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        {t('auth.otp_subtitle')} <strong>{email}</strong>
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', margin: 'var(--space-3) 0' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <input
            key={i}
            maxLength={1}
            inputMode="numeric"
            style={{ width: 40, height: 48, textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1.1rem' }}
          />
        ))}
      </div>
      <button type="button" className="btn btn-primary btn-block">
        {t('auth.confirm')}
      </button>
    </div>
  );
}
