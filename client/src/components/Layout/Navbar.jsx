import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { path: '/feed', label: 'Opinion Feed', icon: '💬' },
  { path: '/wallet', label: 'Wallet', icon: '💰' },
  { path: '/brands', label: 'For Brands', icon: '🏷️' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <nav style={{
      display: 'flex', alignItems: 'center',
      padding: '0 1.5rem', height: '64px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      gap: '8px',
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/feed')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F5C842, #FFB700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#1a1000',
        }}>O</div>
        <span style={{
          fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800,
          background: 'linear-gradient(135deg, #F5C842, #A78BFA)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Opinifi</span>
      </div>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', gap: '4px', marginLeft: '1.5rem' }} className="hide-mobile">
        {NAV_LINKS.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              background: pathname === link.path ? 'rgba(123,92,250,0.18)' : 'transparent',
              color: pathname === link.path ? 'var(--accent2)' : 'var(--muted)',
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (pathname !== link.path) e.target.style.background = 'rgba(123,92,250,0.08)';
            }}
            onMouseLeave={(e) => {
              if (pathname !== link.path) e.target.style.background = 'transparent';
            }}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Coin badge */}
        <div className="coin-badge hide-mobile">
          <div className="pulse-dot" />
          {(user?.opCoins || 0).toLocaleString()} OP
        </div>

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7B5CFA, #5B3FD9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              border: profileOpen ? '2px solid var(--accent2)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {initials}
          </div>

          {profileOpen && (
            <div style={{
              position: 'absolute', top: '46px', right: 0,
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '0.5rem',
              minWidth: '200px', boxShadow: 'var(--shadow-lg)',
              zIndex: 200, animation: 'fadeIn 0.15s ease',
            }}>
              <div style={{ padding: '0.75rem 0.75rem 0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user?.email}</div>
              </div>
              {[
                { label: '👤 My Profile', action: () => navigate('/profile') },
                { label: '💰 My Wallet', action: () => navigate('/wallet') },
                { label: '⚙️ Settings', action: () => navigate('/settings') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setProfileOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.6rem 0.75rem', border: 'none', background: 'transparent',
                    color: 'var(--muted)', fontSize: 14, borderRadius: '8px',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'var(--surface)'; e.target.style.color = 'var(--txt)'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--muted)'; }}
                >
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => { logout(); setProfileOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.6rem 0.75rem', border: 'none', background: 'transparent',
                    color: 'var(--red)', fontSize: 14, borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {profileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
          onClick={() => setProfileOpen(false)}
        />
      )}
    </nav>
  );
}
