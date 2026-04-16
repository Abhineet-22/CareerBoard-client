import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  adminCreateUser,
  adminDeleteUser,
  adminFetchUsers,
  adminUpdateUser,
} from '../api';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const roles = useMemo(() => ['Candidate', 'Recruiter', ...(isAdmin ? ['Admin'] : [])], [isAdmin]);
  const [role, setRole] = useState('Candidate');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminFetchUsers(role);
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const heading = useMemo(() => `${role} management`, [role]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '' });
    setError('');
    setStatus('');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!form.name || !form.email || (!editingUser && !form.password) || (role === 'Admin' && !editingUser && !form.password)) {
      setError('Name, email, and password are required for new users.');
      return;
    }

    try {
      if (editingUser) {
        await adminUpdateUser(role, editingUser._id, {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
        });
        setStatus('User updated successfully.');
      } else {
        await adminCreateUser(role, form);
        setStatus('User created successfully.');
      }
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user.');
    }
  }

  function startEdit(user) {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '' });
    setError('');
    setStatus('');
  }

  async function removeUser(user) {
    if (!window.confirm(`Delete ${user.name} (${user.role})? This cannot be undone.`)) {
      return;
    }

    try {
      await adminDeleteUser(role, user._id);
      setStatus('User deleted successfully.');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user.');
    }
  }

  return (
    <div className="page-bg" style={{ minHeight: 'calc(100vh - 56px)', padding: '2rem' }}>
      <div className="form-card" style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.0rem' }}>Admin Panel</h1>
            <p style={{ margin: '12px 0 0', color: '#c3c7d0' }}>Manage candidate and recruiter accounts.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {roles.map((item) => (
              <button
                key={item}
                type="button"
                className="btn"
                style={{
                  background: item === role ? '#185FA5' : 'transparent',
                  color: item === role ? '#fff' : 'inherit',
                  border: item === role ? '1px solid #185FA5' : '1px solid rgba(255,255,255,0.15)',
                }}
                onClick={() => {
                  setRole(item);
                  resetForm();
                }}
              >
                {item}s
              </button>
            ))}
          </div>
        </div>

        <section style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 360px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0 }}>{heading}</h2>
                <span style={{ color: '#8a8f9b' }}>{loading ? 'Refreshing…' : `${users.length} records`}</span>
              </div>

              {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}
              {status && <div className="success-banner" style={{ marginTop: 16, padding: '12px 14px', background: '#1d4d24', color: '#d4f8d4', borderRadius: 8 }}>{status}</div>}

              <div style={{ overflowX: 'auto', marginTop: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px 8px' }}>Name</th>
                      <th style={{ padding: '12px 8px' }}>Email</th>
                      <th style={{ padding: '12px 8px' }}>Role</th>
                      <th style={{ padding: '12px 8px', width: 180 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '12px 8px' }}>{user.name}</td>
                        <td style={{ padding: '12px 8px' }}>{user.email}</td>
                        <td style={{ padding: '12px 8px' }}>{user.role}</td>
                        <td style={{ padding: '12px 8px', display: 'flex', gap: 8 }}>
                          <button type="button" className="btn" onClick={() => startEdit(user)}>Edit</button>
                          <button type="button" className="btn" onClick={() => removeUser(user)} style={{ background: '#7c1f1f' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {!loading && users.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '18px 8px', color: '#8a8f9b' }}>No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ marginTop: 0 }}>{editingUser ? 'Edit user' : `Add ${role}`}</h2>
              <form onSubmit={submit}>
                <div className="field">
                  <label>Name</label>
                  <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
                </div>
                <div className="field">
                  <label>Password {editingUser ? '(leave blank to keep current)' : ''}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder={editingUser ? 'Optional' : ''}
                    minLength={editingUser ? undefined : 6}
                    {...(editingUser ? {} : { required: true })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                  {editingUser ? 'Save changes' : 'Create user'}
                </button>
                {editingUser && (
                  <button type="button" className="btn" onClick={resetForm} style={{ width: '100%', marginTop: 8 }}>
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
