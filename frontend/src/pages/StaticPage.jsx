// One component reused for About / Privacy Policy / Refund Policy /
// Terms & Conditions / Contact Us — content will come from the admin's
// cmsPages module; titleKey lets each route pass its own heading for now.
export default function StaticPage({ title }) {
  return (
    <div className="card">
      <h1>{title}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Content managed via the admin cmsPages module (not built yet).</p>
    </div>
  );
}
