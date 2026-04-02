import { Link } from 'react-router-dom';
import { Terminal, DatabaseZap } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <Terminal className="logo-icon" />
          <span className="logo-text">QTM<span className="logo-text-highlight">_NET</span></span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            [ Archive ]
          </Link>
          <Link to="/create" className="btn btn-primary nav-btn">
            <DatabaseZap size={16} />
            Transmit
          </Link>
        </div>
      </div>
    </nav>
  );
}
