import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchStories, type Story } from '../api';
import { StoryCard } from '../components/StoryCard';
import './Home.css';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories()
      .then(data => setStories(data.slice(0, 4))) // Only show 4 recent stories
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__inner container">
          <div className="hero__badge">
            <Sparkles size={14} />
            Storytelling Reimagined
          </div>

          <h1 className="hero__title">
            Stories that live beyond the moment.
          </h1>

          <p className="hero__sub">
            The Quantum is a home for bold narratives, immersive characters,
            and ideas that outlast the page. Discover stories that matter.
          </p>
        </div>

        <div className="hero__orb hero__orb--1" aria-hidden="true" />
        <div className="hero__orb hero__orb--2" aria-hidden="true" />
      </section>

      {/* ── Recent Stories ── */}
      <section className="home-stories container">
        <header className="section-header">
          <div className="section-header__left">
            <TrendingUp size={20} className="section-icon" />
            <h2 className="section-title">Stories</h2>
          </div>
          <Link to="/stories" className="btn btn-ghost btn-sm">
            View All Stories
            <ArrowRight size={14} />
          </Link>
        </header>

        {loading ? (
          <div className="skeleton-grid">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="skeleton-card glass-card">
                <div className="skeleton skeleton--cover" />
                <div className="skeleton-body">
                  <div className="skeleton skeleton--tag" />
                  <div className="skeleton skeleton--title" />
                  <div className="skeleton-meta">
                    <div className="skeleton skeleton--meta-item" />
                    <div className="skeleton skeleton--meta-item" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="story-grid">
            {stories.map(s => <StoryCard key={s.id} story={s} />)}
          </div>
        ) : (
          <div className="empty-state glass-card">
            <BookOpen size={40} className="empty-icon" />
            <h3>No stories found</h3>
            <p>Our authors are currently crafting new worlds. Please check back soon.</p>
          </div>
        )}
      </section>
    </div>
  );
}
