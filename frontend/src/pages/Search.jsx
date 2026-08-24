import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductListing from './ProductListing';

export default function Search() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const title = q ? `${t('search.title')} — "${q}"` : t('search.title');

  return (
    <ProductListing
      title={title}
      breadcrumb={[{ label: t('common.home'), to: '/' }, { label: t('search.title') }]}
      fetchParams={q ? { search: q } : {}}
    />
  );
}
