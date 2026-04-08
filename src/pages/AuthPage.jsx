import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Candidate',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let user;
      if (mode === 'login') {
        user = await login({ email: form.email, password: form.password });
      } else {
        user = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }
      navigate(user.role === 'Recruiter' ? '/recruiter/jobs' : '/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Authentication failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-bg" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
      <form onSubmit={submit} className="form-card" style={{ width: '100%', maxWidth: 460 }}>
        {/* <div className="section-label">Account access</div> */}
        <h2 style={{ margin: '15px 0', textAlign: 'center', fontSize: '34px' }}>{mode === 'login' ? 'Login' : 'Create account'}</h2>

        {mode === 'register' && (
          <div className="field">
            <label>Full name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required minLength={2} />
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <input 
          type="email" 
          value={form.email} 
          onChange={(e) => update('email', e.target.value)} 
          required 
          style={{ backgroundColor: '#16171d', border: '2px solid #2e2b2b' }} />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            minLength={6}
            style={{ backgroundColor: '#16171d', border: '2px solid #2e2b2b' }}
          />
        </div>

        {mode === 'register' && (
          <div className="field">
            <label>User type</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="Candidate">Candidate</option>
              <option value="Recruiter">Recruiter</option>
            </select>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" disabled={submitting} type="submit" style={{ width: '100%' }}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </div>

        <button
          type="button"
          className="btn"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
}
