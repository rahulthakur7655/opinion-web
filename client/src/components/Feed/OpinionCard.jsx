import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CAT_COLORS = {
  sports: '#60A5FA', news: '#FCD34D', polity: '#FCA5A5',
  tech: '#86EFAC', entertainment: '#C084FC', brand: '#F5C842', lifestyle: '#6EE7B7',
};

export default function OpinionCard({ opinion, onVote }) {
  const [selected, setSelected] = useState(opinion.userVote ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(opinion.hasVoted || false);

  const totalVotes = opinion.options.reduce((a, o) => a + (o.votes || 0), 0);
  const catColor = CAT_COLORS[opinion.category] || '#A78BFA';
  const catLabel = opinion.category.charAt(0).toUpperCase() + opinion.category.slice(1);

  const handleSelect = (i) => {
    if (voted) return;
    setSelected(i);
  };

  const handleSubmit = async () => {
    if (selected === null) { toast.error('Please select an option'); return; }
    if (voted) return;
    setSubmitting(true);
    try {
      const result = await onVote(opinion._id, selected);
      setVoted(true);
      toast.success(`+${result.coinsEarned} OP Coins earned! 🪙`, { icon: '🎉' });
      if (result.streakBonus > 0) {
        setTimeout(() => toast.success(`🔥 Streak bonus: +${result.streakBonus} OP!`), 800);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="card card-hoverable" style={{ marginBottom: '12px', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '0.9rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {opinion.icon || '💬'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '0.3rem', lineHeight: 1.35 }}>
            {opinion.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`badge badge-${opinion.category}`}>{catLabel}</span>
            <span style={{
              fontSize: 11, padding: '0.15rem 0.5rem', borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)', color: 'var(--sub)',
            }}>{opinion.subcategory}</span>
            {opinion.isBrandOpinion && (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>by {opinion.brandName}</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--sub)', marginLeft: 'auto' }}>
              {timeAgo(opinion.createdAt)}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
          borderRadius: '99px', padding: '0.3rem 0.75rem',
          fontSize: 12, fontWeight: 700, color: 'var(--gold)',
          flexShrink: 0,
        }}>
          🪙 +{opinion.rewardCoins}
        </div>
      </div>

      {/* Description */}
      {opinion.description && (
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.9rem' }}>
          {opinion.description}
        </p>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
        {opinion.options.map((opt, i) => {
          const pct = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
          const isSelected = selected === i;
          const isWinner = voted && opinion.options.reduce((max, o, idx) =>
            (o.votes || 0) > (opinion.options[max].votes || 0) ? idx : max, 0) === i;

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0.75rem 1rem',
                border: `1px solid ${isSelected && !voted ? 'var(--accent)' : voted && isSelected ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                background: isSelected && !voted
                  ? 'rgba(123,92,250,0.12)'
                  : voted && isSelected
                  ? 'rgba(34,197,94,0.1)'
                  : 'var(--surface)',
                color: 'var(--txt)', cursor: voted ? 'default' : 'pointer',
                textAlign: 'left', fontSize: 14,
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {/* Progress bar background */}
              {voted && (
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  width: `${pct}%`,
                  background: isSelected
                    ? 'rgba(34,197,94,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  transition: 'width 0.6s ease',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Option letter */}
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: isSelected && !voted
                  ? 'var(--accent)' : voted && isSelected
                  ? 'var(--green)' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: isSelected ? '#fff' : 'var(--muted)',
                position: 'relative', zIndex: 1, transition: 'all 0.2s',
              }}>
                {voted && isSelected ? '✓' : String.fromCharCode(65 + i)}
              </div>

              <span style={{ flex: 1, position: 'relative', zIndex: 1, fontWeight: isWinner ? 600 : 400 }}>
                {opt.text}
              </span>

              {voted && (
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: isSelected ? 'var(--green)' : 'var(--muted)',
                  position: 'relative', zIndex: 1,
                }}>
                  {pct}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!voted ? (
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={selected === null || submitting}
            >
              {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Submit Opinion'}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setVoted(true);
                toast('Opinion skipped', { icon: '⏭️' });
              }}
            >
              Skip
            </button>
          </>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--green-bg)', border: '1px solid var(--green-border)',
            borderRadius: '99px', padding: '0.3rem 0.9rem',
            fontSize: 12, fontWeight: 700, color: 'var(--green)',
          }}>
            🪙 +{opinion.rewardCoins} OP Earned!
          </div>
        )}

        <span style={{ fontSize: 12, color: 'var(--sub)', marginLeft: voted ? '8px' : 'auto' }}>
          {(totalVotes + (voted && !opinion.hasVoted ? 1 : 0)).toLocaleString()} opinions
        </span>
      </div>
    </div>
  );
}
