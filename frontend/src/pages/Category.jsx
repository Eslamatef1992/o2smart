import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import ProductListing from './ProductListing';

export default function Category() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [category, setCategory] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    setCategory(undefined);
    apiClient
      .get('/categories')
      .then((res) => setCategory(res.data.data.find((c) => c.slug === slug) || null))
      .catch(() => setCategory(null));
  }, [slug]);

  if (category === undefined) return <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>;
  if (category === null) return <p style={{ color: 'var(--color-text-muted)' }}>{t('product.not_found')}</p>;

  const name = i18n.language === 'ar' ? category.name_ar : category.name_en;

  return (
    <ProductListing
      title={name}
      breadcrumb={[{ label: t('common.home'), to: '/' }, { label: name }]}
      fetchParams={{ categoryId: category.id }}
    />
  );
}
