import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import ProductListing from './ProductListing';

export default function BrandProducts() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [brand, setBrand] = useState(undefined);

  useEffect(() => {
    setBrand(undefined);
    apiClient
      .get('/brands')
      .then((res) => setBrand(res.data.data.find((b) => b.slug === slug) || null))
      .catch(() => setBrand(null));
  }, [slug]);

  if (brand === undefined) return <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>;
  if (brand === null) return <p style={{ color: 'var(--color-text-muted)' }}>{t('product.not_found')}</p>;

  const name = i18n.language === 'ar' ? brand.name_ar : brand.name_en;

  return (
    <ProductListing
      title={name}
      breadcrumb={[
        { label: t('common.home'), to: '/' },
        { label: t('brands_page.title'), to: '/brands' },
        { label: name },
      ]}
      fetchParams={{ brandId: brand.id }}
    />
  );
}
