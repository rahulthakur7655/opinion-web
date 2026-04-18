import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: '🌐', subs: [] },
  { id: 'sports', label: 'Sports', icon: '⚽', subs: ['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Wrestling', 'F1'] },
  { id: 'news', label: 'News', icon: '📰', subs: ['India', 'World', 'Economy', 'Science', 'Environment', 'Health'] },
  { id: 'polity', label: 'Politics', icon: '🏛️', subs: ['Parliament', 'State Politics', 'International', 'Elections', 'Policy'] },
  { id: 'tech', label: 'Technology', icon: '💻', subs: ['AI & ML', 'Startups', 'Gadgets', 'Cybersecurity', 'Space'] },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', subs: ['Bollywood', 'Hollywood', 'Music', 'OTT', 'Gaming'] },
  { id: 'brand', label: 'Brands', icon: '🏷️', subs: ['FMCG', 'Automobile', 'Food & Beverage', 'Fashion', 'Finance'] },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌿', subs: ['Health & Fitness', 'Food', 'Travel', 'Education'] },
];

export default function Sidebar({ activeCategory, activeSub, onCategoryChange, onSubChange }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(activeCategory);

  const handleCat = (id) => {
    setExpanded(id === expanded ? null : id);
    onCategoryChange(id);
    onSubChange(null);
  };

  const handleSub = (e, sub) => {
    e.stopPropagation();
    onSubChange(activeSub === sub ? null : sub);
  };

  return (
    <aside style={{
      width: '250px', background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      padding: '1.25rem 0.75rem',
      overflowY: 'auto', flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: '2px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: 'var(--sub)', padding: '0.5rem 0.75rem', textTransform: 'uppercase', marginBottom: '4px' }}>
        Categories
      </div>

      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const isExpanded = expanded === cat.id;

        return (
          <div key={cat.id}>
            <div
              onClick={() => handleCat(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0.6rem 0.75rem', borderRadius: '10px',
                cursor: 'pointer', transition: 'all 0.15s',
                background: isActive ? 'rgba(123,92,250,0.18)' : 'transparent',
                color: isActive ? 'var(--accent2)' : 'var(--muted)',
                fontWeight: isActive ? 500 : 400, fontSize: 14,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(123,92,250,0.08)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{cat.icon}</span>
              <span style={{ flex: 1 }}>{cat.label}</span>
              {cat.subs.length > 0 && (
                <span style={{ fontSize: 12, opacity: 0.6, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
              )}
            </div>

            {/* Subcategories */}
            {isExpanded && cat.subs.length > 0 && (
              <div style={{ paddingLeft: '34px', marginTop: '2px', marginBottom: '4px' }}>
                {cat.subs.map((sub) => (
                  <div
                    key={sub}
                    onClick={(e) => handleSub(e, sub)}
                    style={{
                      padding: '0.4rem 0.6rem', borderRadius: '8px',
                      fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                      color: activeSub === sub ? 'var(--accent2)' : 'var(--sub)',
                      background: activeSub === sub ? 'rgba(123,92,250,0.12)' : 'transparent',
                      fontWeight: activeSub === sub ? 500 : 400,
                    }}
                    onMouseEnter={(e) => { if (activeSub !== sub) e.currentTarget.style.color = 'var(--txt)'; }}
                    onMouseLeave={(e) => { if (activeSub !== sub) e.currentTarget.style.color = 'var(--sub)'; }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Streak widget */}
      {user && (
        <div style={{
          marginTop: 'auto', paddingTop: '1rem',
          background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
          borderRadius: 'var(--radius)', padding: '1rem', marginTop: '1.5rem',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
            🔥 YOUR STREAK
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>
            {user.currentStreak || 0} Days
          </div>
          <div className="progress-track" style={{ marginTop: '0.5rem' }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, ((user.currentStreak || 0) / 30) * 100)}%` }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: '0.4rem' }}>
            {user.currentStreak >= 30 ? '🏆 Max streak reached!' : `${30 - (user.currentStreak || 0)} days to 30-day bonus`}
          </div>
        </div>
      )}
    </aside>
  );
}
