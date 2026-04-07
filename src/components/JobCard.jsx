import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: job.featured
        ? '0.5px solid var(--color-border-tertiary)'
        : '0.5px solid var(--color-border-tertiary)',
      borderLeft: job.featured ? '2.5px solid #185FA5' : undefined,
      borderRadius: 12,
      padding: '1.25rem',
      cursor: 'pointer',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'}
    >
      {/* Top row — logo, title, company */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            borderRadius: 8,
            border: '0.5px solid var(--color-border-tertiary)',
            background: '#E6F1FB',
            color: '#0C447C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 500, flexShrink: 0,
          }}>
            {job.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
              {job.jobTitle}
              {job.featured && (
                <span style={{
                  fontSize: 10, background: '#E6F1FB', color: '#185FA5',
                  padding: '2px 8px', borderRadius: 999, fontWeight: 500, marginLeft: 8,
                  verticalAlign: 'middle',
                }}>Featured</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {job.companyName}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6,
        marginBottom: 10,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {job.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        <Tag variant="exp">{job.experienceLevel}</Tag>
        <Tag variant="type">{job.jobType}</Tag>
        {job.workArrangement === 'Remote' && <Tag variant="remote">Remote</Tag>}
        {job.skills.slice(0, 3).map(s => <Tag key={s}>{s}</Tag>)}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
          {job.location}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {job.salaryMin && job.salaryMax && (
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              ₹{job.salaryMin}to{job.salaryMax} LPA
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          <button
            onClick={() => navigate(`/apply/${job._id}`)}
            style={{
              fontSize: 14, padding: '5px 14px',
              borderRadius: 8, border: '0.5px solid #185FA5',
              background: '#185FA5', color: '#fff',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function Tag({ children, variant }) {
  const styles = {
    exp:    { background: '#E6F1FB', color: '#0C447C', borderColor: '#B5D4F4' },
    type:   { background: '#EAF3DE', color: '#27500A', borderColor: '#C0DD97' },
    remote: { background: '#FAEEDA', color: '#633806', borderColor: '#FAC775' },
    default:{ background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border-tertiary)' },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{
      fontSize: 11, padding: '3px 9px', borderRadius: 999,
      border: `0.5px solid ${s.borderColor}`,
      background: s.background, color: s.color,
    }}>
      {children}
    </span>
  );
}
