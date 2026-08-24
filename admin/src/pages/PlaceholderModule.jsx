import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function PlaceholderModule({ titleKey }) {
  const { t } = useTranslation();
  return (
    <div className="card empty-state">
      <h2 style={{ marginTop: 0 }}>{t(`nav.${titleKey}`)}</h2>
      <p>{t('placeholder.coming_soon')}</p>
      <Link to="/" className="btn btn-outline btn-sm">
        {t('placeholder.back_to_dashboard')}
      </Link>
    </div>
  );
}
