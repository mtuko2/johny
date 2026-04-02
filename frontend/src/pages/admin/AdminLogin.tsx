import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect back to original attempted URL or default to admin
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <header className="login-header">
          <div className="login-icon-wrap">
            <LogIn size={28} />
          </div>
          <h1 className="login-title">Sign In</h1>
          <p className="login-subtitle">Access your storyteller dashboard.</p>
        </header>

        {error && (
          <div className="login-error" role="alert">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <Mail size={13} /> Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <Lock size={13} /> Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <footer className="login-footer">
          <p>Don't have an account? <Link to="/signup">Register now</Link></p>
        </footer>
      </div>
    </div>
  );
}
