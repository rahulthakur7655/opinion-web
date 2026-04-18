import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', brandName: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); setLoading(false); return; }
        await register(form);
      }
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '1rem',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1a0f3c 0%, #0A0A12 70%)',
    }}>
      {/* Left: Hero (hidden on mobile) */}
      <div className="hide-mobile" style={{ flex: 1, maxWidth: 480, padding: '2rem', marginRight: '2rem' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800,
          background: 'linear-gradient(135deg, #F5C842, #A78BFA)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.15, marginBottom: '1.5rem',
        }}>
          Share Opinions.<br />Earn Real Cash.
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.7, marginBottom: '2rem' }}>
          Opinifi rewards you for sharing what you think. Answer polls, give feedback to brands, and earn OP Coins that convert to real money.
        </p>
        {[
          { icon: '🪙', text: '10 OP Coins = ₹1 Real Money' },
          { icon: '📊', text: 'Hundreds of opinion topics daily' },
          { icon: '💳', text: 'Redeem via UPI or Bank Transfer' },
          { icon: '🏷️', text: 'Get paid to review your favourite brands' },
          { icon: '🔥', text: 'Streak bonuses for daily opinions' },
        ].map((f) => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: 20 }}>{f.icon}</span>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Auth box */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '2.5rem',
        position: 'relative', overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Purple glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(123,92,250,.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #F5C842, #FFB700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#1a1000',
            boxShadow: '0 0 20px rgba(245,200,66,.4)',
          }}>O</div>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800,
            background: 'linear-gradient(135deg, #F5C842, #A78BFA)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Opinifi</span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.8rem' }}>
          Opinions that pay. 🪙 Welcome bonus: 50 OP Coins on signup!
        </p>

        {/* Tab */}
        <div style={{
          display: 'flex', background: 'var(--surface)',
          borderRadius: '10px', padding: '4px', marginBottom: '1.8rem',
        }}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '0.5rem', border: 'none', borderRadius: '8px',
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--muted)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <label className="input-label">Full Name</label>
              <input className="input" placeholder="Your full name" value={form.name}
                onChange={(e) => set('name', e.target.value)} style={{ marginBottom: '1rem' }} required />

              <label className="input-label">Account Type</label>
              <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)} style={{ marginBottom: '1rem' }}>
                <option value="user">👤 User – Earn coins by giving opinions</option>
                <option value="brand">🏷️ Brand – Post surveys & collect feedback</option>
              </select>

              {form.role === 'brand' && (
                <>
                  <label className="input-label">Brand Name</label>
                  <input className="input" placeholder="Your brand / company name" value={form.brandName}
                    onChange={(e) => set('brandName', e.target.value)} style={{ marginBottom: '1rem' }} />
                </>
              )}
            </>
          )}

          <label className="input-label">Email Address</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email}
            onChange={(e) => set('email', e.target.value)} style={{ marginBottom: '1rem' }} required />

          <label className="input-label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={form.password}
            onChange={(e) => set('password', e.target.value)} style={{ marginBottom: '1.4rem' }} required />

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : tab === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <div className="divider" style={{ margin: '1.2rem 0' }}>or</div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {['G  Google', 'in  LinkedIn'].map((s) => (
            <button key={s} onClick={() => toast('Social login coming soon!')}
              style={{
                flex: 1, padding: '0.65rem', border: '1px solid var(--border)',
                background: 'var(--surface)', borderRadius: '10px',
                color: 'var(--muted)', fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              {s}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--sub)', textAlign: 'center', marginTop: '1.2rem' }}>
          By joining you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
