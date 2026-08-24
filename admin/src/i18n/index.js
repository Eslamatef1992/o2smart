import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ar from './ar.json';

export const RTL_LANGS = ['ar'];
const STORAGE_KEY = 'o2smart_admin_lang';

const savedLang = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function applyDocumentDirection(lang) {
  const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

export function setLanguage(lang) {
  i18n.changeLanguage(lang);
  applyDocumentDirection(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // storage can be unavailable — language still works for this session
  }
}

applyDocumentDirection(savedLang);

export default i18n;
