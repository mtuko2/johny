import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User, BookOpen } from 'lucide-react';
import { type Story } from '../api';
import './StoryCard.css';

interface StoryCardProps {
  story: Story;
  featured?: boolean;
}

export function StoryCard({ story, featured = false }: StoryCardProps) {
  const excerpt = story.content.substring(0, featured ? 220 : 120).trim() + '…';
  const date = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const readTime = Math.max(1, Math.ceil(story.content.split(' ').length / 200));

  return (
    <Link
      to={`/story/${story.id}`}
      className={`story-card glass-card ${featured ? 'story-card--featured' : ''}`}
    >
      {story.coverUrl ? (
        <div
          className="story-card__cover"
          style={{ backgroundImage: `url(${story.coverUrl})` }}
        >
          <div className="story-card__cover-overlay" />
        </div>
      ) : (
        <div className="story-card__cover story-card__cover--empty">
          <BookOpen size={28} className="cover-placeholder-icon" />
        </div>
      )}

      <div className="story-card__body">
        {story.tags.length > 0 && (
          <div className="story-card__tags">
            {story.tags.slice(0, 3).map(t => (
              <span key={t.id} className="chip">{t.name}</span>
            ))}
          </div>
        )}

        <h3 className="story-card__title">{story.title}</h3>
        <p className="story-card__excerpt">{excerpt}</p>

        <div className="story-card__meta">
          <span className="meta-item">
            <User size={13} />
            {story.author}
          </span>
          <span className="meta-item">
            <Clock size={13} />
            {date}
          </span>
          <span className="meta-item">
            <BookOpen size={13} />
            {readTime} min read
          </span>
        </div>
      </div>

      <div className="story-card__arrow" aria-hidden="true">
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}
