import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStoryById, type Story } from '../api';
import { ArrowLeft, Clock, User, BookOpen, Tag } from 'lucide-react';
import './StoryDetail.css';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchStoryById(id)
        .then(setStory)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container detail-loading">
        <div className="detail-skeleton">
          <div className="skeleton" style={{ height: '440px', borderRadius: '24px', marginBottom: '2rem' }} />
          <div className="skeleton" style={{ height: '56px', width: '70%', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '18px', width: '40%', marginBottom: '2rem' }} />
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: '14px', marginBottom: '0.6rem', width: i % 2 === 0 ? '90%' : '100%' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="container detail-error">
        <div className="error-card glass-card">
          <BookOpen size={48} className="error-icon" />
          <h2>Story Not Found</h2>
          <p>This story may have been moved or deleted.</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  const readTime = Math.max(1, Math.ceil(story.content.split(' ').length / 200));

  return (
    <article className="story-detail">
      {/* Cover */}
      {story.coverUrl && (
        <div
          className="detail-cover"
          style={{ backgroundImage: `url(${story.coverUrl})` }}
          role="img"
          aria-label={`Cover image for ${story.title}`}
        >
          <div className="detail-cover__overlay" />
        </div>
      )}

      <div className="container">
        {/* Back nav */}
        <div className="detail-back">
          <Link to="/" className="btn btn-ghost detail-back-btn">
            <ArrowLeft size={15} />
            All Stories
          </Link>
        </div>

        {/* Header */}
        <header className="detail-header">
          {story.tags.length > 0 && (
            <div className="detail-tags" aria-label="Story tags">
              <Tag size={14} className="tag-icon" />
              {story.tags.map(t => (
                <span key={t.id} className="chip">{t.name}</span>
              ))}
            </div>
          )}

          <h1 className="detail-title">{story.title}</h1>

          <div className="detail-meta">
            <span className="meta-item">
              <User size={14} />
              {story.author}
            </span>
            <span className="meta-sep" aria-hidden="true">·</span>
            <span className="meta-item">
              <Clock size={14} />
              {date}
            </span>
            <span className="meta-sep" aria-hidden="true">·</span>
            <span className="meta-item">
              <BookOpen size={14} />
              {readTime} min read
            </span>
          </div>
        </header>

        {/* Body */}
        <div className="detail-body">
          <div className="detail-body__inner">
            {story.content.split('\n').filter(p => p.trim()).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="detail-footer">
          <Link to="/" className="btn btn-ghost">
            <ArrowLeft size={15} />
            Read more stories
          </Link>
        </div>
      </div>
    </article>
  );
}
