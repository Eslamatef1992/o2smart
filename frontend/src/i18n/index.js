import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ar from './ar.json';

export const RTL_LANGS = ['ar'];
const STORAGE_KEY = 'o2smart_lang';

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
    // storage can be unavailable (private mode, etc.) — language still
    // works for the current session via i18next's in-memory state.
  }
}

// Set the correct dir/lang on the <html> tag as soon as this module loads,
// so the very first paint is already RTL for Arabic (no flash of LTR).
applyDocumentDirection(savedLang);

export default i18n;
