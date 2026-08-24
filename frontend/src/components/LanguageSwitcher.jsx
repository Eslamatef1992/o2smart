import { useTranslation } from 'react-i18next';
import { setLanguage } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const next = i18n.language === 'ar' ? 'en' : 'ar';

  return (
    <button type="button" className="lang-switch" onClick={() => setLanguage(next)} aria-label="Switch language">
      🇰🇼 <span>{i18n.language === 'ar' ? 'AR' : 'EN'}</span>
    </button>
  );
}
