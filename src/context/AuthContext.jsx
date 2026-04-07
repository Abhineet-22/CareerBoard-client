import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, loginUser, registerUser } from '../api';
import { clearAuthToken, getAuthToken, setAuthToken } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then(({ data }) => setUser(data))
      .catch(() => {
        clearAuthToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(payload) {
    const { data } = await loginUser(payload);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const { data } = await registerUser(payload);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearAuthToken();
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    isRecruiter: user?.role === 'Recruiter',
    login,
    register,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
