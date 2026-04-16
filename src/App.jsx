import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import JobListings from './pages/JobListings';
import PostJob from './pages/PostJob';
import AuthPage from './pages/AuthPage';
import ApplyJob from './pages/ApplyJob';
import RecruiterJobs from './pages/RecruiterJobs';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider, useAuth } from './context/AuthContext';

function CandidateOnlyRoute({ children }) {
  const { loading, isAuthenticated, isRecruiter, isAdmin } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (isRecruiter) return <Navigate to="/recruiter/jobs" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function RecruiterOnlyRoute({ children }) {
  const { loading, isAuthenticated, isRecruiter, isAdmin } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return isRecruiter ? children : <Navigate to="/" replace />;
}

function AdminOnlyRoute({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
}

function AuthOnlyRoute({ children }) {
  const { loading, isAuthenticated, isRecruiter, isAdmin } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return children;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to={isRecruiter ? '/recruiter/jobs' : '/'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={(
              <CandidateOnlyRoute>
                <JobListings />
              </CandidateOnlyRoute>
            )}
          />
          <Route
            path="/apply/:id"
            element={(
              <CandidateOnlyRoute>
                <ApplyJob />
              </CandidateOnlyRoute>
            )}
          />
          <Route
            path="/auth"
            element={(
              <AuthOnlyRoute>
                <AuthPage />
              </AuthOnlyRoute>
            )}
          />
          <Route
            path="/post-job"
            element={(
              <RecruiterOnlyRoute>
                <PostJob />
              </RecruiterOnlyRoute>
            )}
          />
          <Route
            path="/recruiter/jobs"
            element={(
              <RecruiterOnlyRoute>
                <RecruiterJobs />
              </RecruiterOnlyRoute>
            )}
          />
          <Route
            path="/admin"
            element={(
              <AdminOnlyRoute>
                <AdminPanel />
              </AdminOnlyRoute>
            )}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}