import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const { wallet, transactions, redemptions, loading, fetchWallet, fetchTransactions, fetchRedemptions, redeem } = useWallet();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemMethod, setRedeemMethod] = useState('upi');
  const [redeemForm, setRedeemForm] = useState({ opCoins: 100, upiId: user?.upiId || '', accountNumber: '', ifsc: '', accountName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchRedemptions();
  }, []);

  const handleRedeem = async () => {
    if (redeemForm.opCoins < 100) { toast.error('Minimum 100 OP Coins'); return; }
    if (redeemMethod === 'upi' && !redeemForm.upiId) { toast.error('UPI ID required'); return; }
    if (redeemMethod === 'bank' && !redeemForm.accountNumber) { toast.error('Account number required'); return; }

    setSubmitting(true);
    try {
      await redeem({ ...redeemForm, method: redeemMethod });
      setShowRedeemModal(false);
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally {
      setSubmitting(false);
    }
  };

  const coins = wallet?.opCoins ?? user?.opCoins ?? 0;
  const realValue = Math.floor(coins / 10);

  const TXN_ICONS = { earn: '🪙', bonus: '🎁', redeem: '💳', referral: '👥', brand_purchase: '🏷️' };
  const STATUS_COLORS = { pending: '#EAB308', processing: '#3B82F6', completed: '#22C55E', failed: '#EF4444' };

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>

      {/* Hero wallet card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0f3c, #13131F)',
        border: '1px solid var(--accent-border)',
        borderRadius: 'var(--radius-lg)', padding: '2rem',
        marginBottom: '1.5rem', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(123,92,250,.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '0.4rem' }}>TOTAL OP COINS</div>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontSize: 64, fontWeight: 800,
          color: 'var(--gold)', lineHeight: 1, position: 'relative',
        }}>
          {coins.toLocaleString()}
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', margin: '0.4rem 0 0.2rem' }}>
          💡 10 OP Coins = ₹1 Real Money
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', marginBottom: '1.5rem' }}>
          ≈ ₹{realValue.toLocaleString()} Redeemable Value
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-green btn-lg" onClick={() => { setRedeemMethod('upi'); setShowRedeemModal(true); }}>
            💳 Redeem via UPI
          </button>
          <button
            onClick={() => { setRedeemMethod('bank'); setShowRedeemModal(true); }}
            style={{ padding: '0.9rem 2rem', background: 'transparent', border: '1px solid var(--blue)', borderRadius: 'var(--radius)', color: 'var(--blue)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
          >
            🏦 Bank Transfer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }} className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Opinions Given</div>
          <div className="stat-value">{user?.totalOpinionsGiven || 0}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Earned</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{(wallet?.totalEarned || user?.totalEarned || 0).toLocaleString()}</div>
          <div className="stat-sub">Lifetime OP Coins</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Redeemed</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>₹{Math.floor((wallet?.totalRedeemed || 0) / 10)}</div>
          <div className="stat-sub">Cash withdrawn</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: '10px', padding: '4px', marginBottom: '1.2rem' }}>
        {[
          { id: 'transactions', label: '📋 Transactions' },
          { id: 'redemptions', label: '💳 Redemptions' },
          { id: 'howto', label: '💡 How It Works' },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '0.5rem', border: 'none', borderRadius: '8px',
            background: activeTab === t.id ? 'var(--accent)' : 'transparent',
            color: activeTab === t.id ? '#fff' : 'var(--muted)',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 1rem' }}>
          {transactions.length === 0 && !loading && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">📋</div>
              <div className="empty-text">No transactions yet</div>
              <div className="empty-sub">Start giving opinions to earn OP Coins!</div>
            </div>
          )}
          {transactions.map((t, i) => (
            <div key={t._id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '0.9rem 0',
              borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '10px', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: t.amount > 0 ? 'var(--green-bg)' : 'var(--red-bg)',
              }}>
                {TXN_ICONS[t.type] || '🪙'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>
                  {new Date(t.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.amount > 0 ? 'var(--green)' : 'var(--red)' }}>
                {t.amount > 0 ? '+' : ''}{t.amount} {t.type === 'redeem' ? '₹' : 'OP'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Redemptions */}
      {activeTab === 'redemptions' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 1rem' }}>
          {redemptions.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">💳</div>
              <div className="empty-text">No redemptions yet</div>
              <div className="empty-sub">You need at least 100 OP Coins (₹10) to redeem</div>
            </div>
          )}
          {redemptions.map((r, i) => (
            <div key={r._id} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '0.9rem 0',
              borderBottom: i < redemptions.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: '10px', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue-bg)' }}>
                {r.method === 'upi' ? '💳' : '🏦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>₹{r.realAmountINR} via {r.method.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{r.opCoinsUsed} OP Coins • {new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '99px',
                background: `${STATUS_COLORS[r.status]}22`, color: STATUS_COLORS[r.status],
              }}>
                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      {activeTab === 'howto' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          {[
            { icon: '💬', title: 'Give your opinion', desc: 'Answer polls and surveys across sports, news, politics, tech, and brand feedback.' },
            { icon: '🪙', title: 'Earn OP Coins', desc: 'Every submitted opinion earns you OP Coins. Brand surveys pay more. Streak bonuses add extra.' },
            { icon: '💱', title: 'Convert to cash', desc: '10 OP Coins = ₹1. Minimum redemption is 100 OP Coins (₹10). Maximum ₹500/day.' },
            { icon: '💳', title: 'Withdraw to UPI/Bank', desc: 'UPI transfers in 2–4 hours. Bank transfers in 1–2 business days. Completely free.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '1.2rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '12px', fontSize: 22, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: '0.2rem' }}>{s.title}</div>
                <div style={{ color: 'var(--muted)', fontSize: 14 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="overlay" onClick={() => setShowRedeemModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: '0.5rem', textAlign: 'center' }}>
              {redeemMethod === 'upi' ? '💳' : '🏦'}
            </div>
            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              Redeem via {redeemMethod === 'upi' ? 'UPI' : 'Bank Transfer'}
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>
              Balance: <strong style={{ color: 'var(--gold)' }}>{coins} OP</strong> = <strong style={{ color: 'var(--green)' }}>₹{realValue}</strong>
            </p>

            <label className="input-label">OP Coins to Redeem (min 100)</label>
            <input className="input" type="number" min="100" max={coins} value={redeemForm.opCoins}
              onChange={(e) => setRedeemForm((p) => ({ ...p, opCoins: +e.target.value }))}
              style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: '1rem' }}>
              = ₹{Math.floor(redeemForm.opCoins / 10)} will be transferred
            </div>

            {redeemMethod === 'upi' ? (
              <>
                <label className="input-label">UPI ID</label>
                <input className="input" placeholder="name@upi" value={redeemForm.upiId}
                  onChange={(e) => setRedeemForm((p) => ({ ...p, upiId: e.target.value }))}
                  style={{ marginBottom: '1.2rem' }} />
              </>
            ) : (
              <>
                <label className="input-label">Account Number</label>
                <input className="input" placeholder="Enter account number" value={redeemForm.accountNumber}
                  onChange={(e) => setRedeemForm((p) => ({ ...p, accountNumber: e.target.value }))}
                  style={{ marginBottom: '1rem' }} />
                <label className="input-label">IFSC Code</label>
                <input className="input" placeholder="SBIN0001234" value={redeemForm.ifsc}
                  onChange={(e) => setRedeemForm((p) => ({ ...p, ifsc: e.target.value }))}
                  style={{ marginBottom: '1.2rem' }} />
              </>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-green btn-full" onClick={handleRedeem} disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Confirm Redemption'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowRedeemModal(false)} style={{ flexShrink: 0 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
