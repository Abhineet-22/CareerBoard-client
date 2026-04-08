import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import JobListings from './pages/JobListings';
import PostJob from './pages/PostJob';
import AuthPage from './pages/AuthPage';
import RecruiterJobs from './pages/RecruiterJobs';
import { AuthProvider, useAuth } from './context/AuthContext';

function CandidateOnlyRoute({ children }) {
  const { loading, isAuthenticated, isRecruiter } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return isRecruiter ? <Navigate to="/recruiter/jobs" replace /> : children;
}

function RecruiterOnlyRoute({ children }) {
  const { loading, isAuthenticated, isRecruiter } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return isRecruiter ? children : <Navigate to="/" replace />;
}

function AuthOnlyRoute({ children }) {
  const { loading, isAuthenticated, isRecruiter } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return children;
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}