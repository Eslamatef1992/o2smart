import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from './icons';

// A single "Category ▾" / "Color ▾" style filter control: a pill trigger
// that opens a checkbox list panel. Used for every facet on the listing/
// search pages (category, brand, and any product attribute like Storage or
// Color that appears in the current result set).
export default function FilterDropdown({ label, options, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!options || options.length === 0) return null;

  return (
    <div className="filter-dropdown" ref={ref}>
      <button type="button" className="filter-dropdown__trigger" onClick={() => setOpen((o) => !o)}>
        {label} {selected.size > 0 && `(${selected.size})`}
        <ChevronDownIcon width={14} height={14} />
      </button>
      {open && (
        <div className="filter-dropdown__panel">
          {options.map((opt) => (
            <label className="option" key={opt.id}>
              <input type="checkbox" checked={selected.has(opt.id)} onChange={() => onToggle(opt.id)} />
              {opt.swatch && <span className="color-swatch" style={{ background: opt.swatch, width: 14, height: 14 }} />}
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
