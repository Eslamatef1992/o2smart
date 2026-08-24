import { useTranslation } from 'react-i18next';

export default function MyAccount() {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-4)' }}>
      <aside className="card">
        <nav style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <span>{t('account.my_information')}</span>
          <span>{t('account.my_delivery_address')}</span>
          <span>{t('account.my_order')}</span>
        </nav>
      </aside>
      <section className="card">
        <h2>{t('account.my_information')}</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Profile form TODO — wires up once the auth/users module exists.</p>
      </section>
    </div>
  );
}
