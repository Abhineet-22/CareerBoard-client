import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import JobListings from './pages/JobListings';
import PostJob from './pages/PostJob';
import ApplyJob from './pages/ApplyJob';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function RecruiterOnlyRoute({ children }) {
  const { loading, isRecruiter } = useAuth();
  if (loading) return null;
  return isRecruiter ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"           element={<JobListings />} />
          <Route path="/auth"       element={<AuthPage />} />
          <Route
            path="/post-job"
            element={(
              <RecruiterOnlyRoute>
                <PostJob />
              </RecruiterOnlyRoute>
            )}
          />
          <Route path="/apply/:id"  element={<ApplyJob />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}