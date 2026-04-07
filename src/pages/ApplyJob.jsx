import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobs, applyToJob } from '../api';
import '../App.css';

// ─── Validation helpers ──────────────────────────────────────────────────────
const validators = {
  firstName:      v => v.trim().length >= 1 || 'First name is required.',
  lastName:       v => v.trim().length >= 1 || 'Last name is required.',
  email:          v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
  phone:          v => /^[\d\s\\+\-\\(\\)]{7,15}$/.test(v.trim()) || 'Enter a valid phone number.',
  candLocation:   v => v.trim().length >= 2 || 'Location is required.',
  linkedin:       v => !v.trim() || /^https:\/\/(www\.)?linkedin\.com\/.+/.test(v.trim()) || 'Enter a valid LinkedIn URL.',
  portfolio:      v => !v.trim() || /^https?:\/\/.+\..+/.test(v.trim()) || 'Enter a valid URL.',
  totalExp:       v => v !== '' || 'Please select your experience level.',
  currentRole:    v => v.trim().length >= 2 || 'Please enter your current or last role.',
  currentCompany: v => v.trim().length >= 2 || 'Please enter your current or last company.',
  noticePeriod:   v => v !== '' || 'Please select your notice period.',
  coverMessage:   v => v.trim().length >= 100 || 'Cover message must be at least 100 characters.',
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

// ─── Presentational: Field wrapper ──────────────────────────────────────────
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

// ─── Presentational: Step bar ────────────────────────────────────────────────
function StepBar({ current }) {
  const steps = ['Your profile', 'Experience', 'Cover message'];
  return (
    <div className="steps">
      {steps.map((label, i) => {
        const n = i + 1;
        return (
          <div key={n} style={{ display:'flex', alignItems:'center', flex: n < steps.length ? 1 : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 4 }}>
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

// ─── Presentational: Resume upload zone ─────────────────────────────────────
function ResumeUpload({ file, onFile, error }) {
  const inputRef = useRef();

  function handleChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    const validExt  = /\.(pdf|doc|docx)$/i.test(f.name);
    const validSize = f.size <= 5 * 1024 * 1024;
    if (!validExt)  return onFile(null, 'Only PDF or DOCX files are accepted.');
    if (!validSize) return onFile(null, 'File too large. Max size is 5 MB.');
    onFile(f, null);
  }

  return (
    <div
      className={`upload-zone ${file ? 'has-file' : ''} ${error ? 'error-zone' : ''}`}
      onClick={() => inputRef.current.click()}
    >
      <div className="upload-text">
        {file
          ? <><strong>{file.name}</strong> — {Math.round(file.size / 1024)} KB</>
          : <><strong>Click to upload</strong> or drag and drop</>
        }
      </div>
      <div className="upload-sub">{file ? 'Click to change file' : 'PDF or DOCX · Max 5 MB'}</div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
}

// ─── Presentational: Skills tag input ───────────────────────────────────────
function SkillsInput({ skills, onChange }) {
  const [input, setInput] = useState('');

  function add(e) {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const val = input.replace(/,/g, '').trim();
    if (!val || skills.includes(val) || skills.length >= 12) { setInput(''); return; }
    onChange([...skills, val]);
    setInput('');
  }

  return (
    <div className="skills-container" onClick={() => document.getElementById('cand-skill-input').focus()}>
      {skills.map(s => (
        <div key={s} className="skill-tag">
          {s}
          <button type="button" onClick={() => onChange(skills.filter(x => x !== s))}>×</button>
        </div>
      ))}
      <input
        id="cand-skill-input"
        className="skill-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={skills.length ? '' : 'Add your skills — press Enter or comma…'}
      />
    </div>
  );
}

// ─── Presentational: Job context banner ─────────────────────────────────────
function JobBanner({ job }) {
  if (!job) return null;
  return (
    <div className="job-banner">
      <div className="job-banner-left">
        <div className="jb-logo">{job.companyName.slice(0, 2).toUpperCase()}</div>
        <div>
          <div className="jb-title">{job.jobTitle}</div>
          <div className="jb-sub">{job.companyName} · {job.location}</div>
        </div>
      </div>
      <div className="jb-tags">
        <span className="tag tag-blue">{job.experienceLevel}</span>
        <span className="tag">{job.jobType}</span>
        {job.salaryMin && job.salaryMax && (
          <span className="tag">₹{job.salaryMin}to{job.salaryMax} LPA</span>
        )}
      </div>
    </div>
  );
}

// ─── Presentational: Success screen ─────────────────────────────────────────
function SuccessScreen({ application, job }) {
  const navigate = useNavigate();
  return (
    <div className="success-card" style={{ display: 'block' }}>
      <div className="success-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l4 4L19 7" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2>Application submitted!</h2>
      <p>
        Your application for <strong>{job?.jobTitle}</strong> at <strong>{job?.companyName}</strong> has
        been received. The hiring team will be in touch within 5 to 7 business days.
      </p>
      <div className="success-meta">
        <div className="success-meta-row"><span>Applicant</span><span>{application.firstName} {application.lastName}</span></div>
        <div className="success-meta-row"><span>Email</span><span>{application.email}</span></div>
        <div className="success-meta-row"><span>Experience</span><span>{application.totalExp}</span></div>
        <div className="success-meta-row"><span>Notice period</span><span>{application.noticePeriod}</span></div>
        <div className="success-meta-row"><span>Application ID</span><span>#{application._id?.slice(-6).toUpperCase()}</span></div>
      </div>
      <div className="success-actions">
        <button className="btn btn-primary" onClick={() => navigate('/')}>Browse more jobs</button>
      </div>
    </div>
  );
}

// ─── Container: ApplyJob page ────────────────────────────────────────────────
const INITIAL = {
  firstName: '', lastName: '', email: '', phone: '', candLocation: '',
  linkedin: '', portfolio: '',
  totalExp: '', currentRole: '', currentCompany: '',
  skills: [], noticePeriod: '', expectedSalary: '',
  coverMessage: '', referral: '', referralName: '',
  consent: false,
};

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job,         setJob]         = useState(null);
  const [jobLoading,  setJobLoading]  = useState(true);
  const [jobError,    setJobError]    = useState(null);

  const [step,        setStep]        = useState(1);
  const [data,        setData]        = useState(INITIAL);
  const [errors,      setErrors]      = useState({});
  const [resume,      setResume]      = useState(null);
  const [resumeError, setResumeError] = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted,   setSubmitted]   = useState(null);

  // Load the job this application is for
  useEffect(() => {
    async function load() {
      setJobLoading(true);
      try {
        const { data: jobs } = await fetchJobs();
        const found = jobs.find(j => j._id === id);
        if (!found) { setJobError('Job not found.'); return; }
        setJob(found);
      } catch {
        setJobError('Could not load job details.');
      } finally {
        setJobLoading(false);
      }
    }
    load();
  }, [id]);

  function set(field, value) {
    setData(d => ({ ...d, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  }

  function blurValidate(field) {
    const err = validate(field, data[field] ?? '');
    setErrors(e => ({ ...e, [field]: err }));
  }

  const I = (field, extra = {}) => ({
    value: data[field],
    onChange: e => set(field, e.target.value),
    onBlur: () => blurValidate(field),
    className: errors[field] ? 'error' : data[field] ? 'valid' : '',
    ...extra,
  });

  const STEP_FIELDS = {
    1: ['firstName', 'lastName', 'email', 'phone', 'candLocation', 'linkedin', 'portfolio'],
    2: ['totalExp', 'currentRole', 'currentCompany', 'noticePeriod'],
    3: ['coverMessage'],
  };

  function advance() {
    const stepErrors = validateAll(STEP_FIELDS[step], data);

    if (step === 1 && !resume) {
      setResumeError('Please upload your resume (PDF or DOCX).');
      if (Object.keys(stepErrors).length) { setErrors(stepErrors); return; }
      return;
    }
    if (step === 2 && data.skills.length < 2)
      stepErrors.skills = 'Please add at least two skills.';

    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return; }
    setStep(s => s + 1);
  }

  async function submit() {
    // Validate step 3 fields
    const stepErrors = validateAll(STEP_FIELDS[3], data);
    if (!data.consent) stepErrors.consent = 'You must agree to the privacy policy to submit.';
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return; }

    setSubmitting(true);
    setSubmitError(null);

    // Build FormData — required because we're uploading a file
    const form = new FormData();
    form.append('jobId',          id);
    form.append('firstName',      data.firstName);
    form.append('lastName',       data.lastName);
    form.append('email',          data.email);
    form.append('phone',          data.phone);
    form.append('location',       data.candLocation);
    form.append('linkedin',       data.linkedin);
    form.append('portfolio',      data.portfolio);
    form.append('totalExp',       data.totalExp);
    form.append('currentRole',    data.currentRole);
    form.append('currentCompany', data.currentCompany);
    form.append('skills',         JSON.stringify(data.skills));
    form.append('noticePeriod',   data.noticePeriod);
    form.append('expectedSalary', data.expectedSalary);
    form.append('coverMessage',   data.coverMessage);
    form.append('referral',       data.referral);
    form.append('referralName',   data.referralName);
    form.append('resume',         resume);

    try {
      const { data: application } = await applyToJob(form);
      setSubmitted(application);
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg
        || err.response?.data?.error
        || 'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render: loading / error for job fetch ──
  if (jobLoading) return <div className="page-bg"><p style={{ padding: '2rem', textAlign: 'center' }}>Loading job details…</p></div>;
  if (jobError)   return (
    <div className="page-bg">
      <div className="error-banner" style={{ maxWidth: 480, margin: '2rem auto' }}>
        {jobError}
        <button onClick={() => navigate('/')}>Back to listings</button>
      </div>
    </div>
  );

  // ── Render: success ──
  if (submitted) return (
    <div className="page-bg">
      <SuccessScreen application={submitted} job={job} />
    </div>
  );

  return (
    <div className="page-bg">
      <JobBanner job={job} />

      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <StepBar current={step} />

      {/* ── Step 1: Profile ── */}
      {step === 1 && (
        <div className="form-card">
          <div className="section-label">Your profile</div>

          <div className="field-row">
            <Field label="First name" required error={errors.firstName}>
              <input type="text" placeholder="Arjun" {...I('firstName')} />
            </Field>
            <Field label="Last name" required error={errors.lastName}>
              <input type="text" placeholder="Sharma" {...I('lastName')} />
            </Field>
          </div>

          <Field label="Email address" required error={errors.email}>
            <input type="email" placeholder="arjun@gmail.com" {...I('email')} />
          </Field>

          <div className="field-row">
            <Field label="Phone number" required error={errors.phone}>
              <input type="tel" placeholder="+91 98765 43210" {...I('phone')} />
            </Field>
            <Field label="Current location" required error={errors.candLocation}>
              <input type="text" placeholder="e.g. Bangalore" {...I('candLocation')} />
            </Field>
          </div>

          <Field label="LinkedIn profile" optional error={errors.linkedin}>
            <input type="url" placeholder="https://linkedin.com/in/your-name" {...I('linkedin')} />
          </Field>

          <Field label="Portfolio / GitHub" optional error={errors.portfolio}>
            <input type="url" placeholder="https://github.com/yourname" {...I('portfolio')} />
          </Field>

          <Field label="Resume / CV" required error={resumeError}>
            <ResumeUpload
              file={resume}
              onFile={(f, err) => { setResume(f); setResumeError(err); }}
              error={!!resumeError}
            />
          </Field>

          <div className="form-footer">
            <span className="step-info">Step 1 of 3</span>
            <button className="btn btn-primary" onClick={advance}>Continue</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Experience ── */}
      {step === 2 && (
        <div className="form-card">
          <div className="section-label">Experience &amp; skills</div>

          <div className="field-row">
            <Field label="Total experience" required error={errors.totalExp}>
              <select {...I('totalExp')}>
                <option value="">Select experience</option>
                {['Less than 1 year','1–2 years','2–4 years','4–6 years','6–9 years','9+ years']
                  .map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Current / last role" required error={errors.currentRole}>
              <input type="text" placeholder="e.g. Frontend Engineer" {...I('currentRole')} />
            </Field>
          </div>

          <Field label="Current / last company" required error={errors.currentCompany}>
            <input type="text" placeholder="e.g. Infosys" {...I('currentCompany')} />
          </Field>

          <Field label="Key skills" required error={errors.skills}
            hint="Add skills relevant to this role — press Enter or comma to add each.">
            <SkillsInput
              skills={data.skills}
              onChange={v => { set('skills', v); if (errors.skills) setErrors(e => ({...e, skills: null})); }}
            />
          </Field>

          <Field label="Notice period" required error={errors.noticePeriod}>
            <select {...I('noticePeriod')}>
              <option value="">Select notice period</option>
              {['Immediate joiner','15 days','30 days','60 days','90 days','More than 90 days']
                .map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Expected salary" optional hint="Leave blank if you prefer to discuss.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>
              <input type="text" placeholder="e.g. 35" {...I('expectedSalary')} />
              <select style={{ width: '100%' }}>
                <option>LPA</option>
                <option>Per month</option>
              </select>
            </div>
          </Field>

          <div className="form-footer">
            <button className="btn" onClick={() => setStep(1)}>Back</button>
            <span className="step-info">Step 2 of 3</span>
            <button className="btn btn-primary" onClick={advance}>Continue</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Cover message ── */}
      {step === 3 && (
        <div className="form-card">
          <div className="section-label">Cover message</div>

          <div className="cover-tips">
            <p>
              <strong>Tips:</strong> Mention what excites you about this specific role, highlight 1–2 achievements
              with numbers, and end with a clear call to action. Keep it between 100–400 words.
            </p>
          </div>

          <Field label="Cover message" required error={errors.coverMessage}>
            <textarea
              rows={8}
              placeholder={`Hi ${job?.companyName} team,\n\nI'm excited to apply for the ${job?.jobTitle} role…`}
              {...I('coverMessage')}
            />
            <div className="char-count">{data.coverMessage.length} / 1500</div>
          </Field>

          <Field label="How did you hear about this role?" optional>
            <select {...I('referral')}>
              <option value="">Select an option</option>
              {['CareerBoard search','LinkedIn','Referred by someone at the company','Job fair / event','Company website','Other']
                .map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Referral name" optional hint="Only if referred by someone at the company.">
            <input type="text" placeholder="Name of person who referred you" {...I('referralName')} />
          </Field>

          <div className="field">
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontWeight: 400 }}>
              <input
                type="checkbox"
                checked={data.consent}
                onChange={e => { set('consent', e.target.checked); if (errors.consent) setErrors(er => ({...er, consent: null})); }}
                style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0, accentColor: '#185FA5' }}
              />
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                I agree that my profile and application data may be shared with {job?.companyName} for this application.
              </span>
            </label>
            {errors.consent && <div className="err-msg show">{errors.consent}</div>}
          </div>

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
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
