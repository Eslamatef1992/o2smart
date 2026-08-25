import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

const EMPTY = {
  categoryId: '',
  subcategoryId: '',
  brandId: '',
  nameEn: '',
  nameAr: '',
  slug: '',
  descriptionEn: '',
  descriptionAr: '',
  sku: '',
  price: '',
  salePrice: '',
  stockQuantity: 0,
  isActive: true,
  sortOrder: 0,
};

export default function ProductForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]); // [{imageUrl}]
  const [variants, setVariants] = useState([]); // [{sku, price, salePrice, stockQuantity, isActive, attributeValueIds:[]}]
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]); // [{id, name_en, values: [{id, value_en}]}]
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const imageFileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null); // null | 'new' | row index
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    apiClient.get('/categories').then(({ data }) => setCategories(data.data)).catch(() => setCategories([]));
    apiClient.get('/brands').then(({ data }) => setBrands(data.data)).catch(() => setBrands([]));
    apiClient
      .get('/attributes')
      .then(async ({ data }) => {
        const types = data.data;
        const withValues = await Promise.all(
          types.map(async (attr) => {
            try {
              const { data: valData } = await apiClient.get(`/attribute-values?attributeId=${attr.id}`);
              return { ...attr, values: valData.data };
            } catch {
              return { ...attr, values: [] };
            }
          })
        );
        setAttributes(withValues);
      })
      .catch(() => setAttributes([]));
  }, []);

  useEffect(() => {
    if (!form.categoryId) {
      setSubcategories([]);
      return;
    }
    apiClient
      .get(`/subcategories?categoryId=${form.categoryId}`)
      .then(({ data }) => setSubcategories(data.data))
      .catch(() => setSubcategories([]));
  }, [form.categoryId]);

  useEffect(() => {
    if (!isEdit) return;
    apiClient
      .get(`/products/${id}`)
      .then(({ data }) => {
        const p = data.data;
        setForm({
          categoryId: p.category_id || '',
          subcategoryId: p.subcategory_id || '',
          brandId: p.brand_id || '',
          nameEn: p.name_en,
          nameAr: p.name_ar,
          slug: p.slug,
          descriptionEn: p.description_en || '',
          descriptionAr: p.description_ar || '',
          sku: p.sku,
          price: p.price,
          salePrice: p.sale_price || '',
          stockQuantity: p.stock_quantity,
          isActive: !!p.is_active,
          sortOrder: p.sort_order,
        });
        setImages((p.images || []).map((img) => ({ imageUrl: img.image_url })));
        setVariants(
          (p.variants || []).map((v) => ({
            sku: v.sku,
            price: v.price || '',
            salePrice: v.sale_price || '',
            stockQuantity: v.stock_quantity,
            isActive: !!v.is_active,
            attributeValueIds: (v.attributeValues || []).map((av) => av.id),
          }))
        );
      })
      .catch((err) => setError(err.response?.data?.message || t('common.error_generic')))
      .finally(() => setLoading(false));
  }, [id, isEdit, t]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateImage(index, value) {
    setImages((imgs) => imgs.map((img, i) => (i === index ? { imageUrl: value } : img)));
  }
  function removeImage(index) {
    setImages((imgs) => imgs.filter((_, i) => i !== index));
  }

  // Gallery upload: one hidden file input shared by "+ Add Image" (target
  // 'new', appends a row) and each row's "Replace" button (target = that
  // row's index, overwrites just that row's URL).
  function triggerImageUpload(target) {
    setImageError('');
    setUploadTarget(target);
    imageFileInputRef.current?.click();
  }

  async function handleImageFileChange(e) {
    const file = e.target.files?.[0];
    const target = uploadTarget;
    if (!file || target === null) return;
    setImageError('');
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await apiClient.post('/uploads', formData);
      const url = data.data.url;
      if (target === 'new') {
        setImages((imgs) => [...imgs, { imageUrl: url }]);
      } else {
        updateImage(target, url);
      }
    } catch (err) {
      setImageError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setImageUploading(false);
      setUploadTarget(null);
      e.target.value = '';
    }
  }

  function addVariant() {
    setVariants((vs) => [...vs, { sku: '', price: '', salePrice: '', stockQuantity: 0, isActive: true, attributeValueIds: [] }]);
  }
  function updateVariant(index, patch) {
    setVariants((vs) => vs.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  function removeVariant(index) {
    setVariants((vs) => vs.filter((_, i) => i !== index));
  }
  function setVariantAttributeValue(index, attributeId, attributeValueId) {
    setVariants((vs) =>
      vs.map((v, i) => {
        if (i !== index) return v;
        const otherAttrValueIds = v.attributeValueIds.filter((valId) => {
          const attr = attributes.find((a) => a.values.some((val) => val.id === valId));
          return attr ? attr.id !== attributeId : true;
        });
        return {
          ...v,
          attributeValueIds: attributeValueId ? [...otherAttrValueIds, Number(attributeValueId)] : otherAttrValueIds,
        };
      })
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      subcategoryId: form.subcategoryId ? Number(form.subcategoryId) : null,
      brandId: form.brandId ? Number(form.brandId) : null,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stockQuantity: Number(form.stockQuantity),
      sortOrder: Number(form.sortOrder),
      images: images.filter((img) => img.imageUrl),
      variants: variants
        .filter((v) => v.sku)
        .map((v) => ({
          ...v,
          price: v.price ? Number(v.price) : null,
          salePrice: v.salePrice ? Number(v.salePrice) : null,
          stockQuantity: Number(v.stockQuantity),
        })),
    };
    try {
      if (isEdit) {
        await apiClient.put(`/products/${id}`, payload);
      } else {
        await apiClient.post('/products', payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || t('common.error_generic'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">{t('common.loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? t('common.edit') : t('common.add_new')} — {t('nav.products')}</h1>
        <Link to="/products" className="btn btn-outline btn-sm">
          ← {t('nav.products')}
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Basic Info</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>Category</label>
              <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} required>
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Subcategory</label>
              <select value={form.subcategoryId} onChange={(e) => set('subcategoryId', e.target.value)}>
                <option value="">— None —</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Brand</label>
              <select value={form.brandId} onChange={(e) => set('brandId', e.target.value)}>
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>{t('common.name_en')}</label>
              <input value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>{t('common.name_ar')}</label>
              <input value={form.nameAr} onChange={(e) => set('nameAr', e.target.value)} required dir="rtl" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>{t('common.slug')}</label>
              <input value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>SKU</label>
              <input value={form.sku} onChange={(e) => set('sku', e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>Price (KWD)</label>
              <input type="number" step="0.001" value={form.price} onChange={(e) => set('price', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Sale Price (KWD)</label>
              <input type="number" step="0.001" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Base Stock Qty</label>
              <input
                type="number"
                value={form.stockQuantity}
                onChange={(e) => set('stockQuantity', e.target.value)}
                disabled={variants.length > 0}
                title={variants.length > 0 ? 'Ignored — this product has variants, each variant has its own stock' : ''}
              />
            </div>
            <div className="form-field">
              <label>Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label>Description (English)</label>
              <textarea rows={4} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Description (Arabic)</label>
              <textarea rows={4} dir="rtl" value={form.descriptionAr} onChange={(e) => set('descriptionAr', e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
            {t('common.active')}
          </label>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Images</h2>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => triggerImageUpload('new')}
              disabled={imageUploading}
            >
              {imageUploading && uploadTarget === 'new' ? 'Uploading…' : '+ Add Image'}
            </button>
          </div>
          {images.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No images yet.</p>}
          {images.map((img, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              {img.imageUrl ? (
                <img src={img.imageUrl} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 6,
                    border: '1px dashed var(--color-border)',
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  flex: 1,
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {img.imageUrl || 'No image'}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => triggerImageUpload(i)}
                disabled={imageUploading}
              >
                {imageUploading && uploadTarget === i ? 'Uploading…' : img.imageUrl ? 'Replace' : 'Upload'}
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeImage(i)}>
                Remove
              </button>
            </div>
          ))}
          {imageError && <p className="form-error">{imageError}</p>}
          <input
            ref={imageFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleImageFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>Variants</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={addVariant}>
              + Add Variant
            </button>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Optional. Leave empty for a simple product using the base price/stock above. Add rows for
            variant combinations (e.g. 256GB + Black) — each variant tracks its own SKU, price and stock.
          </p>
          {variants.map((v, i) => (
            <div key={i} className="card" style={{ marginBottom: 10, background: 'var(--white-100)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>SKU</label>
                  <input value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>Price override</label>
                  <input type="number" step="0.001" value={v.price} onChange={(e) => updateVariant(i, { price: e.target.value })} />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>Sale Price override</label>
                  <input type="number" step="0.001" value={v.salePrice} onChange={(e) => updateVariant(i, { salePrice: e.target.value })} />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>Stock Qty</label>
                  <input type="number" value={v.stockQuantity} onChange={(e) => updateVariant(i, { stockQuantity: e.target.value })} />
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeVariant(i)}>
                  Remove
                </button>
              </div>
              {attributes.length > 0 && (
                <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  {attributes.map((attr) => {
                    const selected = attr.values.find((val) => v.attributeValueIds.includes(val.id));
                    return (
                      <div className="form-field" style={{ marginBottom: 0, minWidth: 140 }} key={attr.id}>
                        <label>{attr.name_en}</label>
                        <select
                          value={selected ? selected.id : ''}
                          onChange={(e) => setVariantAttributeValue(i, attr.id, e.target.value)}
                        >
                          <option value="">—</option>
                          {attr.values.map((val) => (
                            <option key={val.id} value={val.id}>
                              {val.value_en}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Link to="/products" className="btn btn-outline">
            {t('common.cancel')}
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
