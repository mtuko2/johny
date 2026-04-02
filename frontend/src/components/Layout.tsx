import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Layers, Home, PenLine, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout-root">
      <header className="navbar-wrap">
        <nav className="navbar container">
          <Link to="/" className="navbar-brand" aria-label="The Quantum Home">
            <img src="/logo.png" alt="The Quantum" className="brand-logo" />
            <span className="brand-text">THE QUANTUM TALES</span>
          </Link>

          <div className="navbar-right">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Home size={15} />
              Home
            </Link>
            <Link
              to="/stories"
              className={`nav-link ${location.pathname === '/stories' ? 'active' : ''}`}
            >
              <Layers size={15} />
              Stories
            </Link>

            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isAuthenticated && (
              <>
                <div className="nav-divider" />
                <Link to="/admin" className="nav-link">
                  <Layers size={15} />
                  Dashboard
                </Link>
                <Link to="/admin/write" className="btn btn-primary nav-cta">
                  <PenLine size={15} />
                  Write
                </Link>
                <button onClick={handleLogout} className="nav-link logout-btn" title="Sign Out">
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>

      <footer className="layout-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src="/logo.png" alt="The Quantum" className="footer-logo" />
            <span className="brand-text-footer">THE QUANTUM TALES</span>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} THE QUANTUM TALES. {isAuthenticated ? `Logged in as ${user?.name}` : 'Stories that matter.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
