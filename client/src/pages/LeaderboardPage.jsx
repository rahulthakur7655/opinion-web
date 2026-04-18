import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../context/AuthContext';

const RANK_STYLES = {
  0: { bg: 'rgba(245,200,66,.2)', color: '#F5C842', label: '🥇' },
  1: { bg: 'rgba(170,180,200,.15)', color: '#A0AEC0', label: '🥈' },
  2: { bg: 'rgba(180,130,70,.2)', color: '#CD7F32', label: '🥉' },
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { fetchLeaderboard } = useWallet();
  const [leaders, setLeaders] = useState([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(period)
      .then(setLeaders)
      .finally(() => setLoading(false));
  }, [period]);

  const isMe = (leader) => leader._id === user?._id || leader.name === user?.name;

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: 56, marginBottom: '0.5rem' }}>🏆</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: '0.4rem' }}>Opinion Leaders</h1>
        <p style={{ color: 'var(--muted)' }}>Top earners win monthly cash prizes!</p>
      </div>

      {/* Period filter */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem', maxWidth: 300, margin: '0 auto 1.5rem' }}>
        {[{ v: 'week', l: 'This Week' }, { v: 'month', l: 'This Month' }, { v: 'all', l: 'All Time' }].map((p) => (
          <button key={p.v} onClick={() => setPeriod(p.v)} style={{
            flex: 1, padding: '0.5rem', border: 'none', borderRadius: '8px',
            background: period === p.v ? 'var(--accent)' : 'transparent',
            color: period === p.v ? '#fff' : 'var(--muted)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
          }}>{p.l}</button>
        ))}
      </div>

      {/* Top 3 podium */}
      {leaders.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '12px', marginBottom: '2rem' }}>
          {[leaders[1], leaders[0], leaders[2]].map((leader, i) => {
            const rank = i === 1 ? 0 : i === 0 ? 1 : 2; // 1st place center
            const heights = [120, 160, 100];
            const rs = RANK_STYLES[rank];
            return (
              <div key={leader._id || i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              }}>
                <div style={{ fontSize: 24 }}>{rs.label}</div>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${rs.color}44, ${rs.color}22)`,
                  border: `2px solid ${rs.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: rs.color,
                }}>
                  {(leader.name || '?').substring(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', maxWidth: 80 }}>{leader.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>{(leader.totalCoins || 0).toLocaleString()} OP</div>
                <div style={{
                  width: 90, height: heights[i],
                  background: `linear-gradient(180deg, ${rs.color}33, ${rs.color}11)`,
                  border: `1px solid ${rs.color}44`,
                  borderRadius: '10px 10px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: rs.color,
                }}>
                  {rank + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
        {loading ? (
          [1,2,3,4,5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: '12px' }} />
          ))
        ) : leaders.map((leader, i) => {
          const rs = RANK_STYLES[i] || null;
          const me = isMe(leader);
          return (
            <div key={leader._id || i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '0.85rem 1rem',
              background: me ? 'rgba(123,92,250,.1)' : 'var(--card)',
              border: `1px solid ${me ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '12px',
              transition: 'all 0.2s',
              animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: rs ? rs.bg : 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: rs ? 16 : 12, fontWeight: 800,
                color: rs ? rs.color : 'var(--muted)',
                fontFamily: 'Syne, sans-serif',
              }}>
                {rs ? rs.label : i + 1}
              </div>

              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: me ? 'linear-gradient(135deg, #7B5CFA, #5B3FD9)' : 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {(leader.name || '?').substring(0, 2).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {leader.name}
                  {me && <span style={{ fontSize: 11, background: 'rgba(123,92,250,.25)', color: 'var(--accent2)', padding: '0.1rem 0.5rem', borderRadius: '99px', marginLeft: '8px' }}>You</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{leader.totalOpinionsGiven || 0} opinions given</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>🪙 {(leader.totalCoins || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>≈ ₹{Math.floor((leader.totalCoins || 0) / 10)}</div>
              </div>
            </div>
          );
        })}

        {!loading && leaders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <div className="empty-text">No data yet for this period</div>
          </div>
        )}
      </div>

      {/* Monthly prizes */}
      <div className="card" style={{ background: 'var(--card)' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: '1rem' }}>🎁 Monthly Prize Pool</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
          {[
            { rank: '🥇 Rank 1', prize: '₹500 Cash', extra: '+ Trophy NFT' },
            { rank: '🥈 Rank 2', prize: '₹300 Cash', extra: '+ Badge' },
            { rank: '🥉 Rank 3', prize: '₹150 Cash', extra: '+ Badge' },
          ].map((p) => (
            <div key={p.rank} style={{
              padding: '0.9rem', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, marginBottom: '0.3rem' }}>{p.rank}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>{p.prize}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: '0.2rem' }}>{p.extra}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: '1rem', textAlign: 'center' }}>
          Rankings reset on the 1st of every month. Keep giving opinions to climb! 🔥
        </div>
      </div>
    </main>
  );
}
