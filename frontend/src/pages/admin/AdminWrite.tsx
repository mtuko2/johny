import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminCreateStory, adminUpdateStory, adminFetchStories, adminUploadCover, type Story } from '../../api';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  Save, Eye, ArrowLeft, Tag, User, Image,
  BarChart3, PenLine, LogOut, AlertCircle, CheckCircle
} from 'lucide-react';
import './AdminWrite.css';

export default function AdminWrite() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingStory, setLoadingStory] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    author: user?.name || '',
    coverUrl: '',
    tags: '',
    status: 'PUBLISHED',
    scheduledPublishAt: '',
  });

  // Load existing story for edit
  useEffect(() => {
    if (!isEdit || !id) return;
    setLoadingStory(true);
    adminFetchStories()
      .then(stories => {
        const s = stories.find(s => s.id === id);
        if (s) {
          setForm({
            title: s.title,
            content: s.content,
            author: s.author,
            coverUrl: s.coverUrl || '',
            tags: s.tags.map((t: Story['tags'][0]) => t.name).join(', '),
            status: s.status || 'PUBLISHED',
            scheduledPublishAt: s.scheduledPublishAt ? new Date(new Date(s.scheduledPublishAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
          });
        } else {
          navigate('/admin', { replace: true });
        }
      })
      .catch(e => {
        if (e instanceof Error && e.message === 'UNAUTHORIZED') {
          logout(); navigate('/admin/login', { replace: true });
        }
      })
      .finally(() => setLoadingStory(false));
  }, [id, isEdit, logout, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleQuillChange = (content: string) => {
    setForm(prev => ({ ...prev, content }));
    setSaved(false);
  };

  const quillModules = {
    toolbar: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'color': []}, {'background': []}],
      [{'header': 1}, {'header': 2}, 'blockquote', 'code-block'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      [{'align': []}],
      ['link', 'clean']
    ]
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      setError('Only PNG or JPEG images are allowed.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const { url } = await adminUploadCover(file);
      setForm(prev => ({ ...prev, coverUrl: url }));
      setSaved(false);
    } catch {
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = () => ({
    title: form.title,
    content: form.content,
    author: form.author || user?.name || 'Anonymous',
    coverUrl: form.coverUrl || undefined,
    status: form.status,
    scheduledPublishAt: form.status === 'SCHEDULED' ? (form.scheduledPublishAt ? new Date(form.scheduledPublishAt).toISOString() : null) : null,
    tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      if (isEdit && id) {
        await adminUpdateStory(id, buildPayload());
      } else {
        await adminCreateStory(buildPayload());
      }
      setSaved(true);
      if (!isEdit) {
        setTimeout(() => navigate('/admin'), 1200);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        logout(); navigate('/admin/login', { replace: true });
      } else {
        setError('Failed to save. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (loadingStory) {
    return (
      <div className="admin-page">
        <aside className="admin-sidebar glass-card">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="The Quantum" className="sidebar-logo" />
            <div className="sidebar-brand-titles">
            <span className="sidebar-brand-name">THE QUANTUM TALES</span>
            <span className="sidebar-label">Loading…</span>
          </div>
          </div>
        </aside>
        <div className="admin-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="write-loading">Loading story…</div>
        </div>
      </div>
    );
  }

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
          <Link to="/admin" className="sidebar-link"><BarChart3 size={17} /> Dashboard</Link>
          <Link to="/admin/write" className="sidebar-link active"><PenLine size={17} /> New Story</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="sidebar-link">
            <Eye size={17} /> View Site
          </a>
        </nav>
        <button className="sidebar-logout" onClick={() => { logout(); navigate('/admin/login'); }}>
          <LogOut size={17} /> Logout
        </button>
      </aside>

      {/* Editor */}
      <div className="admin-main write-layout">
        <form onSubmit={handleSave} noValidate>
          {/* Top Bar */}
          <div className="write-topbar">
            <Link to="/admin" className="btn btn-ghost write-back">
              <ArrowLeft size={15} /> Back
            </Link>
            <h1 className="write-heading">{isEdit ? 'Edit Story' : 'New Story'}</h1>
            <div className="write-actions">
              {saved && (
                <span className="save-badge">
                  <CheckCircle size={14} /> Saved
                </span>
              )}
              <button type="submit" id="publish-btn" className="btn btn-primary" disabled={loading}>
                <Save size={15} />
                {loading ? 'Saving…' : form.status === 'DRAFT' ? 'Save Draft' : form.status === 'SCHEDULED' ? 'Schedule Story' : isEdit ? 'Save Changes' : 'Publish Story'}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Editor Grid */}
          <div className="write-grid">
            {/* Content Area */}
            <div className="write-content-col">
              <input
                id="story-title"
                name="title"
                type="text"
                required
                className="title-input"
                value={form.title}
                onChange={handleChange}
                placeholder="Story title…"
                aria-label="Story title"
              />

              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={handleQuillChange}
                modules={quillModules}
                placeholder="Start writing your story here…"
                className="content-editor quill-editor"
              />

              <div className="write-stats">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{readTime} min read</span>
              </div>
            </div>

            {/* Sidebar Fields */}
            <div className="write-meta-col glass-card">
              <h3 className="meta-col-title">Story Details</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="story-status">
                  Status
                </label>
                <select 
                  id="story-status"
                  name="status"
                  className="form-control"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="PUBLISHED">Publish Now</option>
                  <option value="DRAFT">Save as Draft</option>
                  <option value="SCHEDULED">Schedule for Later</option>
                </select>
              </div>

              {form.status === 'SCHEDULED' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="story-schedule">
                    Publish Date & Time
                  </label>
                  <input
                    id="story-schedule"
                    name="scheduledPublishAt"
                    type="datetime-local"
                    className="form-control"
                    value={form.scheduledPublishAt}
                    onChange={handleChange}
                    required={form.status === 'SCHEDULED'}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="story-author">
                  <User size={13} /> Author
                </label>
                <input
                  id="story-author"
                  name="author"
                  type="text"
                  className="form-control"
                  value={form.author}
                  onChange={handleChange}
                  placeholder={user?.name || "Your pen name"}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="story-tags">
                  <Tag size={13} /> Tags (comma separated)
                </label>
                <input
                  id="story-tags"
                  name="tags"
                  type="text"
                  className="form-control"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="sci-fi, future, AI"
                />
                {form.tags && (
                  <div className="tags-preview">
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={i} className="chip">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="story-cover">
                  <Image size={13} /> Cover Image
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    id="story-cover-file"
                    type="file"
                    className="form-control"
                    accept="image/png, image/jpeg"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ padding: '0.3rem' }}
                  />
                </div>
                <input
                  id="story-cover"
                  name="coverUrl"
                  type="url"
                  className="form-control"
                  value={form.coverUrl}
                  onChange={handleChange}
                  placeholder="Or provide an image URL"
                />
                {uploading && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Uploading image...</div>}
                {form.coverUrl && (
                  <div className="cover-preview" style={{ marginTop: '0.5rem' }}>
                    <img src={form.coverUrl} alt="Cover preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
