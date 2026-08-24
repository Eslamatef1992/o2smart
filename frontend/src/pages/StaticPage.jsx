import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';

// One component reused for About / Privacy Policy / Refund Policy / Terms &
// Conditions / Contact Us. Content comes from the admin's cmsPages module
// (GET /cms-pages is public and returns the full list; there's no
// slug-lookup endpoint yet, so — same pattern as Brands.jsx — we fetch once
// and find the matching slug client-side). `fallbackTitle` renders while
// loading or if the admin hasn't created that page yet.
export default function StaticPage({ slug, fallbackTitle }) {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    setPage(undefined);
    apiClient
      .get('/cms-pages?activeOnly=true')
      .then((res) => setPage(res.data.data.find((p) => p.slug === slug) || null))
      .catch(() => setPage(null));
  }, [slug]);

  const title = page ? (i18n.language === 'ar' ? page.title_ar : page.title_en) : fallbackTitle;
  const content = page ? (i18n.language === 'ar' ? page.content_ar : page.content_en) : null;

  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      {content ? (
        <div style={{ color: 'var(--color-text)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p style={{ color: 'var(--color-text-muted)' }}>{page === undefined ? '' : t('common.content_coming_soon')}</p>
      )}
    </div>
  );
}
