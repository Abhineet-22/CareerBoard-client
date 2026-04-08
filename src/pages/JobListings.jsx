import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJobs } from '../api';
import '../App.css';

// ─── Presentational: single job card ────────────────────────────────────────
function JobCard({ job, onApply }) {
  return (
    <div className={`job-card ${job.featured ? 'featured' : ''}`}>
      <div className="job-top">
        <div className="company-row">
          <div className="company-logo">
            {job.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="job-title">{job.jobTitle}</div>
            <div className="job-company">{job.companyName}</div>
          </div>
        </div>
      </div>

      <p className="job-desc">{job.description}</p>

      <div className="job-tags">
        <span className="tag tag-exp">{job.experienceLevel}</span>
        <span className="tag tag-type">{job.jobType}</span>
        {job.workArrangement === 'Remote' && (
          <span className="tag tag-remote">Remote</span>
        )}
        {job.skills.slice(0, 3).map(s => (
          <span key={s} className="tag">{s}</span>
        ))}
      </div>

      <div className="job-footer">
        <span className="job-location">{job.location}</span>
        <div className="job-footer-right">
          {job.salaryMin && job.salaryMax && (
            <span className="job-salary">
              ₹{job.salaryMin} to ₹{job.salaryMax} LPA
            </span>
          )}
          <span className="job-posted">
            {new Date(job.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short',
            })}
          </span>
          <button className="btn btn-primary" onClick={() => onApply(job._id)}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Presentational: filter sidebar ─────────────────────────────────────────
function FilterSidebar({ filters, onChange, onClear }) {
  const categories  = ['Engineering', 'Design', 'Product', 'Data & Analytics', 'Marketing'];
  const experiences = [
    'Entry Level (0–2 yrs)',
    'Mid Level (2–5 yrs)',
    'Senior (5–8 yrs)',
    'Lead / Manager (8+ yrs)',
  ];
  const types       = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

  function toggle(field, value) {
    const current = filters[field] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [field]: next });
  }

  function renderCheckGroup(field, options) {
    return options.map(opt => (
      <label key={opt} className="filter-option">
        <input
          type="checkbox"
          checked={(filters[field] || []).includes(opt)}
          onChange={() => toggle(field, opt)}
        />
        {opt}
      </label>
    ));
  }

  return (
    <aside className="sidebar">
      <div className="filter-card">
        <div className="filter-title">Category</div>
        {renderCheckGroup('category', categories)}
      </div>
      <div className="filter-card">
        <div className="filter-title">Experience</div>
        {renderCheckGroup('experience', experiences)}
      </div>
      <div className="filter-card">
        <div className="filter-title">Job type</div>
        {renderCheckGroup('type', types)}
      </div>
      <div className="filter-card">
        <div className="filter-title">Work arrangement</div>
        {['On-site', 'Remote', 'Hybrid'].map(opt => (
          <label key={opt} className="filter-option">
            <input
              type="checkbox"
              checked={(filters.arrangement || []).includes(opt)}
              onChange={() => toggle('arrangement', opt)}
            />
            {opt}
          </label>
        ))}
      </div>
      <button className="clear-btn" onClick={onClear}>Clear all filters</button>
    </aside>
  );
}

// ─── Presentational: loading skeleton ───────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="job-card skeleton">
      <div className="sk-line sk-title" />
      <div className="sk-line sk-sub" />
      <div className="sk-line sk-body" />
      <div className="sk-line sk-body short" />
    </div>
  );
}

// ─── Container: JobListings page ─────────────────────────────────────────────
export default function JobListings() {
  const navigate = useNavigate();

  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [filters, setFilters] = useState({});

  // Build query params from filters state
  const buildParams = useCallback(() => {
    const params = {};
    if (search)                       params.q          = search;
    if (filters.category?.length)     params.category = filters.category.join(',');
    if (filters.experience?.length)   params.experience = filters.experience.join(',');
    if (filters.type?.length)         params.type = filters.type.join(',');
    if (filters.arrangement?.length)  params.workArrangement = filters.arrangement.join(',');
    return params;
  }, [search, filters]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchJobs(buildParams());
      setJobs(data);
    } catch {
      setError('Could not load jobs. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Fetch whenever filters change
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') loadJobs();
  }

  function clearAll() {
    setFilters({});
    setSearch('');
  }

  return (
    <div className="page-bg">
      {/* Hero search bar */}
      <div className="hero">
        <h1>Find your next opportunity</h1>
        <h3>Thousands of roles from leading companies — updated daily.</h3>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Job title, skill, or keyword…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button onClick={loadJobs}>Search</button>
        </div>
      </div>

      <div className="layout">
        {/* Filter sidebar (presentational) */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onClear={clearAll}
        />

        {/* Main content */}
        <main className="main">
          <div className="results-bar">
            <div className="results-count">
              {loading
                ? 'Loading…'
                : <><strong>{jobs.length}</strong> job{jobs.length !== 1 ? 's' : ''} found</>
              }
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={loadJobs}>Retry</button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="job-list">
              {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && jobs.length === 0 && (
            <div className="empty">
              <p>No jobs match your current filters.</p>
              <button className="btn" onClick={clearAll}>Clear filters</button>
            </div>
          )}

          {/* Job cards (presentational) */}
          {!loading && !error && jobs.length > 0 && (
            <div className="job-list">
              {jobs.map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApply={id => navigate(`/apply/${id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
