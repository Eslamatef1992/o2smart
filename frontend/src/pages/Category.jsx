import { useParams } from 'react-router-dom';

// Category/search-results page: filter sidebar (Product Type, Price,
// Storage, Color, Brand) + product grid, per build-spec.md §5.
export default function Category() {
  const { slug } = useParams();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--space-4)' }}>
      <aside className="card">
        <h3>Filters</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>Product Type, Price, Storage, Color, Brand — TODO once products/attributes exist.</p>
      </aside>
      <section>
        <h1>{slug}</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Product grid goes here.</p>
      </section>
    </div>
  );
}
