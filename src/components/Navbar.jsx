import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Navbar() {
  // const { pathname } = useLocation();
  const { user, isRecruiter, logout } = useAuth();

  return (
    <nav style={{
      background: '#16171d',
      borderBottom: '0.5px solid #16171d ',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: 34, fontWeight: 500, color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>
          Career<span style={{ color: '#185FA5' }}>Board</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: -1 }}>
        <Link to="/" /*style={navLinkStyle(pathname === '/')}*/ className='btnStyle'>
          Browse Jobs
        </Link>
        {isRecruiter && (
          <Link to="/post-job"
          className='btnStyle'
          >
        Post a Job
          </Link>
        )}
        {!user && (
          <Link to="/auth" className='btnStyle'>Login</Link>
        )}
        {user && (
          <>
            <span /*className='btnStyle'*/>
              {user.role}
            </span>
            <button type="button" onClick={logout} className="btnStyle">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// const btnStyle = {
//   fontSize: "20px",
//   padding: '6px 14px',
//   borderRadius: '8px',
//   border: '0.5px solid var(--color-border-secondary)',
//   background: 'var(--color-background-secondary)',
//   color: '#171ad5',
//   cursor: 'pointer',
//   textDecoration: 'none',
//   display: 'inline-block',
//   fontWeight: 550,
// };

// function navLinkStyle(active) {
//   return {
//     ...btnStyle,
//     background: active ? 'var(--color-background-secondary)' : 'transparent',
//     fontWeight: active ? 500 : 400,
//   };
// }
