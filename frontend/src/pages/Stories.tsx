import { useEffect, useState } from 'react';
import { fetchStories, type Story } from '../api';
import { BookOpen, TrendingUp } from 'lucide-react';
import { StoryCard } from '../components/StoryCard';
import './Stories.css';

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories()
      .then(setStories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = stories;

  return (
    <div className="stories-page container">
      <header className="page-header">
        <div className="section-head">
          <div className="section-head__left">
            <TrendingUp size={18} className="section-head__icon" />
            <h2 className="section-head__title">Explore Stories</h2>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="skeleton-grid">
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton-card glass-card">
              <div className="skeleton skeleton--cover" />
              <div className="skeleton-body">
                <div className="skeleton skeleton--tag" />
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--text" />
                <div className="skeleton skeleton--text short" />
              </div>
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state glass-card">
          <BookOpen size={40} className="empty-icon" />
          <h3>No stories yet</h3>
          <p>Check back soon for new stories.</p>
        </div>
      ) : (
        <>
          {featured && <StoryCard story={featured} featured />}

          {rest.length > 0 && (
            <div className="story-grid">
              {rest.map(s => <StoryCard key={s.id} story={s} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
