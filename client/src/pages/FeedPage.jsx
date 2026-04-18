import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import OpinionCard from '../components/Feed/OpinionCard';
import { useOpinions } from '../hooks/useOpinions';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = [
  { value: '-createdAt', label: '🕐 Latest' },
  { value: '-totalVotes', label: '🔥 Trending' },
  { value: '-rewardCoins', label: '🪙 Highest Reward' },
  { value: 'expiresAt', label: '⏳ Expiring Soon' },
];

export default function FeedPage() {
  const { user } = useAuth();
  const { opinions, loading, hasMore, total, fetchOpinions, loadMore, vote } = useOpinions();
  const [category, setCategory] = useState('all');
  const [sub, setSub] = useState(null);
  const [sort, setSort] = useState('-createdAt');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback((cat, subcategory, sortBy, searchQ) => {
    const filters = { sort: sortBy };
    if (cat && cat !== 'all') filters.category = cat;
    if (subcategory) filters.subcategory = subcategory;
    if (searchQ) filters.search = searchQ;
    fetchOpinions(filters, true);
  }, [fetchOpinions]);

  useEffect(() => {
    load(category, sub, sort, search);
  }, [category, sub, sort, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Sidebar
        activeCategory={category}
        activeSub={sub}
        onCategoryChange={setCategory}
        onSubChange={setSub}
      />

      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }} className="grid-3">
          <div className="stat-card">
            <div className="stat-label">Opinions Given</div>
            <div className="stat-value">{user?.totalOpinionsGiven || 0}</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">OP Coins</div>
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{(user?.opCoins || 0).toLocaleString()}</div>
            <div className="stat-sub">≈ ₹{Math.floor((user?.opCoins || 0) / 10)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Daily Streak</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{user?.currentStreak || 0} 🔥</div>
            <div className="stat-sub">Best: {user?.longestStreak || 0} days</div>
          </div>
        </div>

        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '8px', minWidth: '200px' }}>
            <input
              className="input"
              placeholder="🔍 Search opinions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-outline btn-sm" type="submit">Search</button>
          </form>

          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ width: 'auto', paddingRight: '2rem' }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Section title */}
        <div className="section-header">
          <h2 className="section-title">
            {sub || category === 'all' ? (sub || 'All Opinions') : `${category.charAt(0).toUpperCase() + category.slice(1)} Opinions`}
          </h2>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{total.toLocaleString()} available</span>
        </div>

        {/* Opinion cards */}
        {opinions.map((op) => (
          <OpinionCard key={op._id} opinion={op} onVote={vote} />
        ))}

        {/* Skeletons while loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '12px' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 18, marginBottom: '8px', borderRadius: '6px' }} />
                    <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: '6px' }} />
                  </div>
                </div>
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="skeleton" style={{ height: 44, marginBottom: '8px', borderRadius: '10px' }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && opinions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-text">No opinions found</div>
            <div className="empty-sub">Try a different category or search term</div>
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-outline" onClick={loadMore}>
              Load More Opinions
            </button>
          </div>
        )}

        {/* End of feed */}
        {!loading && !hasMore && opinions.length > 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--sub)', fontSize: 14 }}>
            ✅ You've seen all opinions in this category!
          </div>
        )}
      </main>
    </div>
  );
}
