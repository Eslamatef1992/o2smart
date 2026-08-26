import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductListing from './ProductListing';

export default function Search() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const deals = params.get('deals');
  const sort = params.get('sort');

  // Home page rail "View All" links land here with ?deals=true or ?sort=...
  // instead of a text query, so the title reflects whichever mode is active.
  const title = q
    ? `${t('search.title')} — "${q}"`
    : deals
      ? t('nav.top_deals')
      : sort === 'newest'
        ? t('nav.new_arrivals')
        : t('search.title');

  const fetchParams = {};
  if (q) fetchParams.search = q;
  if (deals) fetchParams.deals = deals;
  if (sort) fetchParams.sort = sort;

  return (
    <ProductListing
      title={title}
      breadcrumb={[{ label: t('common.home'), to: '/' }, { label: title }]}
      fetchParams={fetchParams}
    />
  );
}
