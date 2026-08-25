import { useRef, useState } from 'react';
import apiClient from '../api/client';

// Drop-in replacement for the old "paste an Image URL" text field, used by
// every admin form with an image (categories, subcategories, brands, CMS
// banners, product gallery). Uploads the file straight to POST /uploads and
// stores the URL it gets back — the underlying data model is unchanged
// (still just a URL string in image_url/logo_url), only how it gets there.
export default function ImageUploadField({ label, value, onChange, required = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await apiClient.post('/uploads', formData);
      onChange(data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset so selecting the same file again still fires onChange.
      e.target.value = '';
    }
  }

  return (
    <div className="form-field">
      {label && <label>{label}{required ? ' *' : ''}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {value ? (
          <img
            src={value}
            alt=""
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              border: '1px dashed var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            No image
          </div>
        )}

        <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload Image'}
        </button>

        {value && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange('')} disabled={uploading}>
            Remove
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {error && <p className="form-error" style={{ marginTop: 4 }}>{error}</p>}

      <button
        type="button"
        onClick={() => setShowUrlField((s) => !s)}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          padding: 0,
          marginTop: 4,
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        {showUrlField ? 'Hide URL field' : 'Or paste an image URL instead'}
      </button>
      {showUrlField && (
        <input
          style={{ marginTop: 6 }}
          placeholder="https://…"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
