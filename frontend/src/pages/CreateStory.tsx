import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCreateStory } from '../api';
import { Send, AlertCircle, ArrowLeft } from 'lucide-react';
import './CreateStory.css';

export default function CreateStory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    coverUrl: '',
    tags: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        content: formData.content,
        author: formData.author || undefined,
        coverUrl: formData.coverUrl || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };

      const story = await adminCreateStory(payload);
      navigate(`/story/${story.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = formData.content.trim()
    ? formData.content.trim().split(/\s+/).length
    : 0;

  return (
    <div className="create-page">
      <div className="container">
        <div className="create-back">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </div>

        <div className="create-layout">
          {/* Left: Heading */}
          <div className="create-intro">
            <h1 className="create-title">
              Share your<br />
              <em className="grad-text">story.</em>
            </h1>
            <p className="create-subtitle">
              Your words join a growing collection of ideas, perspectives, and
              narratives. Make them count.
            </p>
            <div className="create-tips glass-card">
              <h4>Writing tips</h4>
              <ul>
                <li>Start with a compelling first sentence.</li>
                <li>Use short paragraphs for readability.</li>
                <li>Add tags to help readers discover your story.</li>
                <li>A cover image brings your story to life.</li>
              </ul>
            </div>
          </div>

          {/* Right: Form */}
          <form
            id="create-form"
            className="create-form glass-card"
            onSubmit={handleSubmit}
            noValidate
          >
            {error && (
              <div className="form-error" role="alert">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Title <span aria-hidden="true">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                placeholder="A headline that captures attention…"
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="author">Author</label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  value={formData.author}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Your name or pen name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tags">Tags</label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="sci-fi, mystery, future…"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="coverUrl">Cover image URL</label>
              <input
                id="coverUrl"
                name="coverUrl"
                type="url"
                value={formData.coverUrl}
                onChange={handleChange}
                className="form-control"
                placeholder="https://example.com/my-image.jpg"
              />
            </div>

            <div className="form-group form-group--content">
              <div className="content-label-row">
                <label className="form-label" htmlFor="content">
                  Story <span aria-hidden="true">*</span>
                </label>
                <span className="word-count" aria-live="polite">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
              </div>
              <textarea
                id="content"
                name="content"
                required
                rows={14}
                value={formData.content}
                onChange={handleChange}
                className="form-control content-area"
                placeholder="Begin writing your story here…"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Publishing…' : (
                  <>
                    Publish Story
                    <Send size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
