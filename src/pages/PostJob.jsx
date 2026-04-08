import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../api';
import '../App.css';

// ─── Validation helpers ──────────────────────────────────────────────────────
const validators = {
  companyName:     v => v.trim().length >= 2  || 'Company name is required.',
  contactEmail:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email.',
  website:         v => !v.trim() || /^https?:\/\/.+\..+/.test(v.trim()) || 'Enter a valid URL.',
  industry:        v => v !== ''  || 'Please select an industry.',
  companySize:     v => v !== ''  || 'Please select company size.',
  jobTitle:        v => v.trim().length >= 3  || 'Job title is required.',
  category:        v => v !== ''  || 'Please select a category.',
  experienceLevel: v => v !== ''  || 'Please select experience level.',
  description:     v => v.trim().length >= 80 || 'Description must be at least 80 characters.',
  jobType:         v => v !== ''  || 'Please select a job type.',
  workArrangement: v => v !== ''  || 'Please select a work arrangement.',
  location:        v => v.trim().length >= 2  || 'Location is required.',
};

function validate(field, value) {
  if (!validators[field]) return null;
  const result = validators[field](value);
  return result === true ? null : result;
}

function validateAll(fields, data) {
  const errors = {};
  fields.forEach(f => {
    const err = validate(f, data[f] ?? '');
    if (err) errors[f] = err;
  });
  return errors;
}

// ─── Presentational: one form field ─────────────────────────────────────────
function Field({ label, required, optional, error, hint, children }) {
  return (
    <div className="field">
      <label>
        {label}
        {required && <span className="req"> *</span>}
        {optional && <span className="opt"> (optional)</span>}
      </label>
      {children}
      {error && <div className="err-msg show">{error}</div>}
      {hint  && <div className="hint">{hint}</div>}
    </div>
  );
}

// ─── Presentational: step indicator ─────────────────────────────────────────
function StepBar({ current }) {
  const steps = ['Company', 'Role', 'Details'];
  return (
    <div className="steps">
      {steps.map((label, i) => {
        const n = i + 1;
        return (
          <div key={n} className={`step-item ${n < steps.length ? 'step-item-grow' : ''}`}>
            <div className="step-node">
              <div className={`step-circle ${n < current ? 'done' : n === current ? 'active' : ''}`}>
                {n < current ? '✓' : n}
              </div>
              <div className={`step-label ${n === current ? 'active' : ''}`}>{label}</div>
            </div>
            {n < steps.length && (
              <div className={`step-line ${n < current ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Presentational: skills tag input ───────────────────────────────────────
function SkillsInput({ skills, onChange }) {
  const [input, setInput] = useState('');

  function add(e) {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const val = input.replace(/,/g, '').trim();
    if (!val || skills.includes(val) || skills.length >= 10) { setInput(''); return; }
    onChange([...skills, val]);
    setInput('');
  }

  function remove(val) {
    onChange(skills.filter(s => s !== val));
  }

  return (
    <div className="skills-container" onClick={() => document.getElementById('skill-input').focus()}>
      {skills.map(s => (
        <div key={s} className="skill-tag">
          {s}
          <button type="button" onClick={() => remove(s)}>×</button>
        </div>
      ))}
      <input
        id="skill-input"
        className="skill-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={skills.length ? '' : 'Type a skill and press Enter…'}
      />
    </div>
  );
}

// ─── Presentational: success screen ─────────────────────────────────────────
function SuccessScreen({ job, onReset }) {
  const navigate = useNavigate();
  return (
    <div className="success-card">
      <div className="success-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l4 4L19 7" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2>Job listing posted!</h2>
      <p>Your opening is now live. Candidates can start applying immediately.</p>
      <div className="success-meta">
        <div className="success-meta-row"><span>Company</span><span>{job.companyName}</span></div>
        <div className="success-meta-row"><span>Role</span><span>{job.jobTitle}</span></div>
        <div className="success-meta-row"><span>Location</span><span>{job.location}</span></div>
        <div className="success-meta-row"><span>Type</span><span>{job.jobType} · {job.workArrangement}</span></div>
      </div>
      <div className="success-actions">
        <button className="btn" onClick={onReset}>Post another job</button>
        <button className="btn btn-primary" onClick={() => navigate('/')}>View listings</button>
      </div>
    </div>
  );
}

// ─── Container: PostJob page ─────────────────────────────────────────────────
const INITIAL = {
  companyName: '', website: '', industry: '', companySize: '', contactEmail: '',
  jobTitle: '', category: '', experienceLevel: '', description: '', skills: [],
  jobType: '', workArrangement: '', location: '',
  salaryMin: '', salaryMax: '', currency: 'INR', notes: '',
};

export default function PostJob() {
  const [step,       setStep]       = useState(1);
  const [data,       setData]       = useState(INITIAL);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError,setSubmitError]= useState(null);
  const [posted,     setPosted]     = useState(null);

  function set(field, value) {
    setData(d => ({ ...d, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  }

  function blurValidate(field) {
    const err = validate(field, data[field] ?? '');
    setErrors(e => ({ ...e, [field]: err }));
  }

  const STEP_FIELDS = {
    1: ['companyName', 'website', 'industry', 'companySize', 'contactEmail'],
    2: ['jobTitle', 'category', 'experienceLevel', 'description'],
    3: ['jobType', 'workArrangement', 'location'],
  };

  function advance() {
    const stepErrors = validateAll(STEP_FIELDS[step], data);
    if (step === 2 && data.skills.length === 0)
      stepErrors.skills = 'Add at least one required skill.';
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return; }
    setStep(s => s + 1);
  }

  async function submit() {
    const stepErrors = validateAll(STEP_FIELDS[3], data);
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data: job } = await createJob({
        ...data,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
      });
      setPosted(job);
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg
        || err.response?.data?.error
        || 'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setData(INITIAL);
    setErrors({});
    setStep(1);
    setPosted(null);
    setSubmitError(null);
  }

  if (posted) return (
    <div className="page-bg">
      <SuccessScreen job={posted} onReset={reset} />
    </div>
  );

  const I = (field, extra = {}) => ({
    value: data[field],
    onChange: e => set(field, e.target.value),
    onBlur: () => blurValidate(field),
    className: errors[field] ? 'error' : data[field] ? 'valid' : '',
    ...extra,
  });

  return (
    <div className="page-bg">
      <div className="page-header">
        <h1>Post a job opening</h1>
        <p>Reach thousands of qualified candidates. Takes about 3 minutes.</p>
      </div>

      <StepBar current={step} />

      {/* ── Step 1: Company ── */}
      {step === 1 && (
        <div className="form-card">
          <div className="section-label">Company information</div>

          <Field label="Company name" required error={errors.companyName}>
            <input type="text" placeholder="e.g. Razorpay" maxLength={80} {...I('companyName')} />
          </Field>

          <div className="field-row">
            <Field label="Company website" optional error={errors.website}>
              <input type="url" placeholder="https://yourcompany.com" {...I('website')} />
            </Field>
            <Field label="Industry" required error={errors.industry}>
              <select {...I('industry')}>
                <option value="">Select industry</option>
                {['Fintech','E-commerce','SaaS / Software','Healthcare','Edtech','Logistics','Media & Entertainment','Other']
                  .map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Company size" required error={errors.companySize}>
            <select {...I('companySize')}>
              <option value="">Select company size</option>
              {['1–10 employees','11–50 employees','51–200 employees','201–500 employees','500+ employees'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Contact email" required error={errors.contactEmail}
            hint="Applications and notifications will be sent here.">
            <input type="email" placeholder="hr@yourcompany.com" {...I('contactEmail')} />
          </Field>

          <div className="form-footer">
            <span className="step-info">Step 1 of 3</span>
            <button className="btn btn-primary" onClick={advance}>Continue</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Role ── */}
      {step === 2 && (
        <div className="form-card">
          <div className="section-label">Role details</div>

          <Field label="Job title" required error={errors.jobTitle}>
            <input type="text" placeholder="e.g. Senior Frontend Engineer" maxLength={120} {...I('jobTitle')} />
          </Field>

          <div className="field-row">
            <Field label="Category" required error={errors.category}>
              <select {...I('category')}>
                <option value="">Select category</option>
                {['Engineering','Design','Product','Data & Analytics','Marketing','Sales','Operations','HR','Finance']
                  .map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Experience level" required error={errors.experienceLevel}>
              <select {...I('experienceLevel')}>
                <option value="">Select level</option>
                {['Entry Level (0–2 yrs)','Mid Level (2–5 yrs)','Senior (5–8 yrs)','Lead / Manager (8+ yrs)']
                  .map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Job description" required error={errors.description}>
            <textarea
              rows={5}
              placeholder="Describe the role, responsibilities, and what success looks like…"
              maxLength={1200}
              {...I('description')}
            />
            <div className="char-count">{data.description.length} / 1200</div>
          </Field>

          <Field label="Required skills" required error={errors.skills}
            hint="Press Enter or comma to add each skill.">
            <SkillsInput
              skills={data.skills}
              onChange={v => { set('skills', v); if (errors.skills) setErrors(e => ({...e, skills: null})); }}
            />
          </Field>

          <div className="form-footer">
            <button className="btn" onClick={() => setStep(1)}>Back</button>
            <span className="step-info">Step 2 of 3</span>
            <button className="btn btn-primary" onClick={advance}>Continue</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Details ── */}
      {step === 3 && (
        <div className="form-card">
          <div className="section-label">Compensation &amp; location</div>

          <div className="field-row">
            <Field label="Job type" required error={errors.jobType}>
              <select {...I('jobType')}>
                <option value="">Select type</option>
                {['Full-time','Part-time','Contract','Internship','Freelance'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Work arrangement" required error={errors.workArrangement}>
              <select {...I('workArrangement')}>
                <option value="">Select arrangement</option>
                {['On-site','Remote','Hybrid'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Location" required error={errors.location}
            hint="For remote roles you can write 'Remote-India' or 'Anywhere'.">
            <input type="text" placeholder="e.g. Bangalore" maxLength={120} {...I('location')} />
          </Field>

          <Field label="Salary range" optional error={errors.salary}>
            <div className="salary-grid">
              <input type="text" placeholder="Min (e.g. 12)" {...I('salaryMin')} />
              <input type="text" placeholder="Max (e.g. 20)" {...I('salaryMax')} />
              <select {...I('currency')}>
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
          </Field>

          <Field label="Additional notes" optional>
            <textarea rows={3} placeholder="Perks, benefits, visa sponsorship…" maxLength={500} {...I('notes')} />
          </Field>

          {submitError && (
            <div className="error-banner">{submitError}</div>
          )}

          <div className="form-footer">
            <button className="btn" onClick={() => setStep(2)}>Back</button>
            <span className="step-info">Step 3 of 3</span>
            <button
              className="btn btn-primary"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? 'Posting…' : 'Post job listing'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
