import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRecruiterJob, fetchJobs, fetchRecruiterJobs, updateRecruiterJob } from '../api';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const EDITABLE_FIELDS = [
  'jobTitle',
  'category',
  'experienceLevel',
  'jobType',
  'workArrangement',
  'location',
  'description',
];

function RecruiterJobCard({ job, onEdit, onDelete }) {
  return (
    <div className="job-card">
      <div className="job-top">
        <div>
          <div className="job-title">{job.jobTitle}</div>
          <div className="job-company">{job.companyName}</div>
        </div>
        <div className="job-footer-right">
          <button className="btn" onClick={() => onEdit(job)}>Edit</button>
          <button className="btn" onClick={() => onDelete(job._id)}>Delete</button>
        </div>
      </div>

      <p className="job-desc">{job.description}</p>

      <div className="job-tags">
        <span className="tag">{job.category}</span>
        <span className="tag">{job.experienceLevel}</span>
        <span className="tag">{job.jobType}</span>
        <span className="tag">{job.workArrangement}</span>
      </div>

      <div className="job-footer">
        <span className="job-location">{job.location}</span>
        <span className="job-posted">
          {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
}

export default function RecruiterJobs() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingJobId, setEditingJobId] = useState('');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadMine() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await fetchRecruiterJobs();
      setJobs(data);
    } catch (err) {
      if (err.response?.status !== 404) {
        const msg = err.response?.data?.error || 'Could not load your posted jobs.';
        setError(msg);
        return;
      }

      try {
        const { data: allJobs } = await fetchJobs();
        const recruiterEmail = user.email?.toLowerCase();
        const recruiterId = String(user.id || '');

        const mine = allJobs.filter((job) => {
          if (job.recruiterId) {
            return String(job.recruiterId) === recruiterId;
          }

          if (job.contactEmail && recruiterEmail) {
            return String(job.contactEmail).toLowerCase() === recruiterEmail;
          }

          return false;
        });

        setJobs(mine);
      } catch (fallbackErr) {
        const msg = fallbackErr.response?.data?.error || 'Could not load your posted jobs.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadMine();
    }
  }, [authLoading, user]);

  function beginEdit(job) {
    setEditingJobId(job._id);
    setDraft({
      jobTitle: job.jobTitle || '',
      category: job.category || '',
      experienceLevel: job.experienceLevel || '',
      jobType: job.jobType || '',
      workArrangement: job.workArrangement || '',
      location: job.location || '',
      description: job.description || '',
    });
    setError('');
  }

  function cancelEdit() {
    setEditingJobId('');
    setDraft(null);
  }

  async function saveEdit() {
    if (!editingJobId || !draft) return;
    setSaving(true);
    setError('');
    try {
      const { data: updated } = await updateRecruiterJob(editingJobId, draft);
      setJobs(prev => prev.map(j => (j._id === updated._id ? updated : j)));
      cancelEdit();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Could not update job.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function removeJob(jobId) {
    const confirmed = window.confirm('Delete this job posting? This action cannot be undone.');
    if (!confirmed) return;

    setError('');
    try {
      await deleteRecruiterJob(jobId);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      if (editingJobId === jobId) cancelEdit();
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not delete job.';
      setError(msg);
    }
  }

  return (
    <div className="page-bg">
      <div className="hero" style={{ marginBottom: 18 }}>
        <h1>Your posted jobs</h1>
        <h3>Manage and update roles posted from your recruiter account.</h3>
        <Link to="/post-job" className="btn btn-primary">Post a new job</Link>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

      {editingJobId && draft && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <div className="section-label">Edit job</div>

          <div className="field-row">
            <div className="field">
              <label>Job title</label>
              <input
                value={draft.jobTitle}
                onChange={(e) => setDraft((d) => ({ ...d, jobTitle: e.target.value }))}
                maxLength={120}
              />
            </div>
            <div className="field">
              <label>Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              >
                {['Engineering', 'Design', 'Product', 'Data & Analytics', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance']
                  .map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Experience level</label>
              <select
                value={draft.experienceLevel}
                onChange={(e) => setDraft((d) => ({ ...d, experienceLevel: e.target.value }))}
              >
                {['Entry Level (0–2 yrs)', 'Mid Level (2–5 yrs)', 'Senior (5–8 yrs)', 'Lead / Manager (8+ yrs)']
                  .map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Job type</label>
              <select
                value={draft.jobType}
                onChange={(e) => setDraft((d) => ({ ...d, jobType: e.target.value }))}
              >
                {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
                  .map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Work arrangement</label>
              <select
                value={draft.workArrangement}
                onChange={(e) => setDraft((d) => ({ ...d, workArrangement: e.target.value }))}
              >
                {['On-site', 'Remote', 'Hybrid'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Location</label>
              <input
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                maxLength={120}
              />
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              maxLength={1200}
            />
          </div>

          <div className="form-footer">
            <button className="btn" onClick={cancelEdit} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="empty">Loading your jobs…</div>}

      {!loading && jobs.length === 0 && (
        <div className="empty">
          <p>You have not posted any jobs yet.</p>
          <Link to="/post-job" className="btn btn-primary">Post your first job</Link>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="job-list">
          {jobs.map((job) => (
            <RecruiterJobCard
              key={job._id}
              job={job}
              onEdit={beginEdit}
              onDelete={removeJob}
            />
          ))}
        </div>
      )}
    </div>
  );
}
