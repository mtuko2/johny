import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authRegister } from '../api';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authRegister(form);
      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card glass-card">
        <header className="signup-header">
          <h1 className="signup-title">Sign Up</h1>
          <p className="signup-subtitle">Join the collection of bold storytellers.</p>
        </header>

        {error && (
          <div className="signup-error">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {success && (
          <div className="signup-success">
            <CheckCircle size={15} />
            Registration successful! Redirecting to login...
          </div>
        )}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              <User size={13} /> Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="form-control"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <Mail size={13} /> Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <Lock size={13} /> Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <footer className="signup-footer">
          Already have an account? <Link to="/admin/login">Log In</Link>
        </footer>
      </div>
    </div>
  );
}
