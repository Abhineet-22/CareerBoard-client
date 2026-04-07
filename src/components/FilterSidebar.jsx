const FILTERS = {
  category:    ['Engineering', 'Design', 'Product', 'Data & Analytics', 'Marketing', 'Sales', 'Operations'],
  experience:  ['Entry Level', 'Mid Level', 'Senior', 'Lead / Manager'],
  type:        ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
  arrangement: ['On-site', 'Remote', 'Hybrid'],
};

export default function FilterSidebar({ filters, onChange, onClear }) {
  function toggle(field, value) {
    const current = filters[field] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [field]: next });
  }

  const hasAny = Object.values(filters).some(arr => arr?.length > 0);

  return (
    <aside style={{ width: 320, flexShrink: 0 }}>

      <FilterCard title="Category">
        {FILTERS.category.map(opt => (
          <CheckOption
            key={opt}
            label={opt}
            checked={(filters.category || []).includes(opt)}
            onChange={() => toggle('category', opt)}
          />
        ))}
      </FilterCard>

      <FilterCard title="Experience level">
        {FILTERS.experience.map(opt => (
          <CheckOption
            key={opt}
            label={opt}
            checked={(filters.experience || []).includes(opt)}
            onChange={() => toggle('experience', opt)}
          />
        ))}
      </FilterCard>

      <FilterCard title="Job type">
        {FILTERS.type.map(opt => (
          <CheckOption
            key={opt}
            label={opt}
            checked={(filters.type || []).includes(opt)}
            onChange={() => toggle('type', opt)}
          />
        ))}
      </FilterCard>

      <FilterCard title="Work arrangement">
        {FILTERS.arrangement.map(opt => (
          <CheckOption
            key={opt}
            label={opt}
            checked={(filters.arrangement || []).includes(opt)}
            onChange={() => toggle('arrangement', opt)}
          />
        ))}
      </FilterCard>

      {hasAny && (
        <button
          onClick={onClear}
          style={{
            fontSize: 14, color: '#185FA5',
            background: 'none', border: 'none',
            cursor: 'pointer', padding: '4px 0',
          }}
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}

function FilterCard({ title, children }) {
  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      padding: '1rem 1.25rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 500,
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        marginBottom: 10,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function CheckOption({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 7, cursor: 'pointer',
      fontSize: 13, color: 'var(--color-text-primary)',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: 14, height: 14, accentColor: '#185FA5', cursor: 'pointer' }}
      />
      {label}
    </label>
  );
}
