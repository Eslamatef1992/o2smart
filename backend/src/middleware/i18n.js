const fs = require('fs');
const path = require('path');

const SUPPORTED_LANGS = ['en', 'ar'];
const DEFAULT_LANG = 'en';

const dictionaries = SUPPORTED_LANGS.reduce((acc, lang) => {
  const file = path.join(__dirname, '..', 'locales', `${lang}.json`);
  acc[lang] = JSON.parse(fs.readFileSync(file, 'utf8'));
  return acc;
}, {});

/**
 * Resolves the request language from (in priority order):
 *   1. ?lang= query param
 *   2. X-Lang header
 *   3. Accept-Language header
 *   4. default ('en')
 *
 * Attaches `req.lang` and `req.t(key)` (a tiny translator for API messages —
 * separate from the frontend's react-i18next, which handles UI copy).
 */
function i18nMiddleware(req, res, next) {
  const fromQuery = req.query.lang;
  const fromHeader = req.get('X-Lang');
  const fromAcceptLanguage = req.acceptsLanguages(SUPPORTED_LANGS);

  const lang = [fromQuery, fromHeader, fromAcceptLanguage].find((l) =>
    SUPPORTED_LANGS.includes(l)
  ) || DEFAULT_LANG;

  req.lang = lang;
  req.t = (key) => dictionaries[lang][key] || dictionaries[DEFAULT_LANG][key] || key;
  res.setHeader('Content-Language', lang);
  next();
}

module.exports = { i18nMiddleware, SUPPORTED_LANGS, DEFAULT_LANG };
