import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Layers, Home, PenLine, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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

          {/* Desktop nav */}
          <div className="navbar-right navbar-desktop">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <Home size={15} />
              Home
            </Link>
            <Link to="/stories" className={`nav-link ${location.pathname === '/stories' ? 'active' : ''}`}>
              <Layers size={15} />
              Stories
            </Link>
            <button onClick={toggleTheme} className="theme-toggle"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {isAuthenticated && (
              <>
                <div className="nav-divider" />
                <Link to="/admin" className="nav-link"><Layers size={15} />Dashboard</Link>
                <Link to="/admin/write" className="btn btn-primary nav-cta"><PenLine size={15} />Write</Link>
                <button onClick={handleLogout} className="nav-link logout-btn" title="Sign Out"><LogOut size={15} /></button>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="navbar-mobile-controls">
            <button onClick={toggleTheme} className="theme-toggle"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              className="hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <div className={`mobile-drawer ${menuOpen ? 'mobile-drawer--open' : ''}`}>
          <div className="mobile-drawer__inner">
            <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <Home size={16} /> Home
            </Link>
            <Link to="/stories" className={`mobile-nav-link ${location.pathname === '/stories' ? 'active' : ''}`}>
              <Layers size={16} /> Stories
            </Link>
            {isAuthenticated && (
              <>
                <div className="mobile-nav-divider" />
                <Link to="/admin" className="mobile-nav-link"><Layers size={16} />Dashboard</Link>
                <Link to="/admin/write" className="btn btn-primary mobile-nav-cta"><PenLine size={15} />Write a Story</Link>
                <button onClick={handleLogout} className="mobile-nav-link mobile-nav-logout"><LogOut size={16} />Sign Out</button>
              </>
            )}
          </div>
        </div>

        {/* Backdrop */}
        {menuOpen && <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-hidden />}
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
