import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminFetchStories, adminDeleteStory, type Story } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  PenLine, Trash2, Eye, LogOut, BookOpen,
  Plus, AlertCircle, BarChart3, Clock, Search
} from 'lucide-react';
import './AdminDashboard.css';

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="stat-card glass-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await adminFetchStories();
      setStories(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        logout();
        navigate('/admin/login', { replace: true });
      } else {
        setError('Failed to load stories.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await adminDeleteStory(id);
      setStories(prev => prev.filter(s => s.id !== id));
    } catch {
      setError('Failed to delete story. Try again.');
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const filtered = stories.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.author.toLowerCase().includes(search.toLowerCase()) ||
    s.tags.some(t => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalWords = stories.reduce((acc, s) => acc + (s.content ? s.content.split(/\s+/).length : 0), 0);
  const avgReadTime = stories.length > 0
    ? Math.round(stories.reduce((acc, s) => acc + Math.ceil((s.content ? s.content.split(/\s+/).length : 0) / 200), 0) / stories.length)
    : 0;

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar glass-card">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="The Quantum" className="sidebar-logo" />
          <div className="sidebar-brand-titles">
            <span className="sidebar-brand-name">THE QUANTUM TALES</span>
            <span className="sidebar-label">{user?.role === 'ADMIN' ? 'Admin' : 'Author'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link active">
            <BarChart3 size={17} /> Dashboard
          </Link>
          <Link to="/admin/write" className="sidebar-link">
            <PenLine size={17} /> New Story
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="sidebar-link">
            <Eye size={17} /> View Site
          </a>
        </nav>

        <button className="sidebar-logout" onClick={() => { logout(); navigate('/admin/login'); }}>
          <LogOut size={17} /> Logout
        </button>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-title">Dashboard</h1>
            <p className="admin-sub">Welcome back, {user?.name}</p>
          </div>
          <Link to="/admin/write" className="btn btn-primary" id="new-story-btn">
            <Plus size={16} /> New Story
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <StatCard icon={<BookOpen size={20} />} label="Total Stories" value={stories.length} />
          <StatCard icon={<PenLine size={20} />} label="Total Words" value={totalWords.toLocaleString()} />
          <StatCard icon={<Clock size={20} />} label="Avg. Read Time" value={`${avgReadTime} min`} />
        </div>

        {/* Error */}
        {error && (
          <div className="admin-error" role="alert">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Search + Table */}
        <div className="table-card glass-card">
          <div className="table-topbar">
            <h2 className="table-title">{user?.role === 'ADMIN' ? 'All Stories' : 'My Stories'}</h2>
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input
                id="story-search"
                type="search"
                className="search-input"
                placeholder="Search by title, author, tag…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search stories"
              />
            </div>
          </div>

          {loading ? (
            <div className="table-loading">
              {[1,2,3].map(i => (
                <div key={i} className="row-skeleton">
                  <div className="skeleton" style={{ width: '40%', height: 16 }} />
                  <div className="skeleton" style={{ width: 80, height: 16 }} />
                  <div className="skeleton" style={{ width: 100, height: 16 }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              <BookOpen size={36} />
              <p>{search ? 'No stories match your search.' : 'No stories yet. Create your first one!'}</p>
              {!search && (
                <Link to="/admin/write" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  <Plus size={15} /> Create Story
                </Link>
              )}
            </div>
          ) : (
            <div className="story-table">
              <div className="table-head">
                <span>Title</span>
                <span>Author</span>
                <span>Tags</span>
                <span>Published</span>
                <span>Actions</span>
              </div>
              {filtered.map(story => (
                <div key={story.id} className="table-row">
                  <span className="row-title">
                    <a href={`/story/${story.id}`} target="_blank" rel="noopener noreferrer" className="row-title-link">
                      {story.title}
                    </a>
                  </span>
                  <span className="row-author">{story.author}</span>
                  <span className="row-tags">
                    {story.tags.slice(0, 2).map(t => (
                      <span key={t.id} className="chip chip-sm">{t.name}</span>
                    ))}
                    {story.tags.length > 2 && <span className="chip chip-sm">+{story.tags.length - 2}</span>}
                  </span>
                  <span className="row-date">
                    {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="row-actions">
                    <Link
                      to={`/admin/write/${story.id}`}
                      className="action-btn edit"
                      title="Edit story"
                      aria-label={`Edit ${story.title}`}
                    >
                      <PenLine size={15} />
                    </Link>
                    <a
                      href={`/story/${story.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn view"
                      title="View story"
                      aria-label={`View ${story.title}`}
                    >
                      <Eye size={15} />
                    </a>
                    {confirmDelete === story.id ? (
                      <span className="confirm-delete">
                        <button
                          className="action-btn danger"
                          onClick={() => handleDelete(story.id)}
                          disabled={deleting === story.id}
                          aria-label="Confirm delete"
                        >
                          {deleting === story.id ? '…' : 'Confirm'}
                        </button>
                        <button
                          className="action-btn cancel"
                          onClick={() => setConfirmDelete(null)}
                          aria-label="Cancel delete"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        className="action-btn delete"
                        onClick={() => setConfirmDelete(story.id)}
                        title="Delete story"
                        aria-label={`Delete ${story.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
