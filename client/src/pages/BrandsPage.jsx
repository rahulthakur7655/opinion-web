import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOpinions } from '../hooks/useOpinions';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'sports', label: '⚽ Sports', subs: ['Football','Cricket','Badminton','Tennis','Basketball','F1'] },
  { id: 'news', label: '📰 News', subs: ['India','World','Economy','Science','Environment'] },
  { id: 'polity', label: '🏛️ Politics', subs: ['Parliament','Elections','Policy','Governance'] },
  { id: 'tech', label: '💻 Technology', subs: ['AI & ML','Startups','Gadgets','Cybersecurity','Space'] },
  { id: 'entertainment', label: '🎬 Entertainment', subs: ['Bollywood','Hollywood','Music','OTT','Gaming'] },
  { id: 'brand', label: '🏷️ Brands', subs: ['FMCG','Automobile','Food & Beverage','Fashion','Finance'] },
  { id: 'lifestyle', label: '🌿 Lifestyle', subs: ['Health & Fitness','Food','Travel','Education'] },
];

const ICONS = ['💬','🏷️','📊','⭐','🎯','🔥','💡','🎁','🚀','🏆'];

export default function BrandsPage() {
  const { user } = useAuth();
  const { createOpinion } = useOpinions();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: 'brand', subcategory: 'FMCG',
    opinionType: 'poll', options: ['', '', '', ''],
    rewardCoins: 8, icon: '🏷️', expiresInDays: 7,
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setOption = (i, v) => {
    const opts = [...form.options];
    opts[i] = v;
    set('options', opts);
  };
  const addOption = () => form.options.length < 8 && set('options', [...form.options, '']);
  const removeOption = (i) => form.options.length > 2 && set('options', form.options.filter((_, idx) => idx !== i));

  const selCat = CATEGORIES.find((c) => c.id === form.category);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Survey title is required'); return; }
    const validOpts = form.options.filter((o) => o.trim());
    if (validOpts.length < 2) { toast.error('At least 2 options are required'); return; }

    setSubmitting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + form.expiresInDays);

      await createOpinion({
        ...form,
        options: validOpts,
        expiresAt,
      });

      toast.success('Survey published! It will appear in the feed after review. 🚀');
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem', maxWidth: 500 }}>
        {[{ id: 'create', label: '✏️ Create Survey' }, { id: 'why', label: '📈 Why Opinifi?' }, { id: 'pricing', label: '💰 Pricing' }].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '0.5rem', border: 'none', borderRadius: '8px',
            background: activeTab === t.id ? 'var(--accent)' : 'transparent',
            color: activeTab === t.id ? '#fff' : 'var(--muted)',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Form */}
          <div>
            <div className="section-header"><h2 className="section-title">Create Brand Survey</h2></div>
            <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              <div>
                <label className="input-label">Survey Title *</label>
                <input className="input" placeholder="What do users think about our new product?" value={form.title} onChange={(e) => set('title', e.target.value)} required />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea className="input" rows={3} placeholder="Give context to your respondents..." value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">Category</label>
                  <select className="input" value={form.category} onChange={(e) => { set('category', e.target.value); set('subcategory', CATEGORIES.find(c => c.id === e.target.value)?.subs[0] || ''); }}>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Sub-Category</label>
                  <select className="input" value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)}>
                    {(selCat?.subs || []).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">Opinion Type</label>
                  <select className="input" value={form.opinionType} onChange={(e) => set('opinionType', e.target.value)}>
                    <option value="poll">📊 Poll</option>
                    <option value="rating">⭐ Rating</option>
                    <option value="feedback">💬 Feedback</option>
                    <option value="survey">📋 Survey</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Survey Icon</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {ICONS.map((ic) => (
                      <button key={ic} type="button" onClick={() => set('icon', ic)} style={{
                        width: 36, height: 36, borderRadius: '8px', fontSize: 18, border: `1px solid ${form.icon === ic ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.icon === ic ? 'var(--accent-bg)' : 'var(--surface)', cursor: 'pointer',
                      }}>{ic}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">Answer Options (2–8) *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: 'var(--surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'var(--muted)', flexShrink: 0, marginTop: 8,
                      }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <input className="input" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => setOption(i, e.target.value)} style={{ flex: 1 }} />
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} style={{
                          width: 36, height: 36, borderRadius: '8px', border: '1px solid var(--border)',
                          background: 'transparent', color: 'var(--red)', cursor: 'pointer', fontSize: 16, marginTop: 2, flexShrink: 0,
                        }}>×</button>
                      )}
                    </div>
                  ))}
                  {form.options.length < 8 && (
                    <button type="button" onClick={addOption} style={{
                      padding: '0.5rem', border: '1px dashed var(--border)', borderRadius: '10px',
                      background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 13,
                    }}>+ Add Option</button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="input-label">Reward per Response (OP)</label>
                  <input className="input" type="number" min="1" max="100" value={form.rewardCoins} onChange={(e) => set('rewardCoins', +e.target.value)} />
                  <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 4 }}>Users earn this per valid response</div>
                </div>
                <div>
                  <label className="input-label">Expires In (Days)</label>
                  <input className="input" type="number" min="1" max="30" value={form.expiresInDays} onChange={(e) => set('expiresInDays', +e.target.value)} />
                </div>
              </div>

              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={submitting}>
                {submitting ? <><span className="spinner" /> Publishing...</> : '🚀 Publish Survey'}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div>
            <div className="section-header"><h2 className="section-title">Live Preview</h2></div>
            <div className="card" style={{ border: '1px solid var(--accent-border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '0.9rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {form.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, marginBottom: '0.3rem' }}>
                    {form.title || 'Your survey title will appear here...'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className={`badge badge-${form.category}`}>{form.category}</span>
                    <span style={{ fontSize: 11, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,.05)', color: 'var(--sub)' }}>{form.subcategory}</span>
                  </div>
                </div>
                <div style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: '99px', padding: '0.3rem 0.75rem', fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                  🪙 +{form.rewardCoins}
                </div>
              </div>
              {form.description && <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '0.9rem' }}>{form.description}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.options.filter(o => o.trim()).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)', fontSize: 14 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    {opt}
                  </div>
                ))}
                {form.options.filter(o => o.trim()).length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--sub)', textAlign: 'center', padding: '1rem' }}>Add options above to preview</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'why' && (
        <div style={{ maxWidth: 700 }}>
          <div className="section-header"><h2 className="section-title">Why Opinifi for Brands?</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: '🎯', title: 'Targeted Reach', desc: 'Reach verified, incentivized users filtered by category and interest area.' },
              { icon: '⚡', title: 'Real-time Insights', desc: 'Live response data, vote distribution charts, and sentiment as votes roll in.' },
              { icon: '💰', title: 'Cost-effective', desc: 'Pay only per valid response. Zero waste on irrelevant audiences.' },
              { icon: '🏆', title: 'High Engagement', desc: 'Users are motivated — they earn real cash rewards for their opinions.' },
              { icon: '📊', title: 'Full Analytics', desc: 'Download response data, demographics breakdown, and trend charts.' },
              { icon: '🔒', title: 'Quality Assured', desc: 'Each respondent is verified. No bots, no fake responses.' },
            ].map((b) => (
              <div key={b.title} className="card" style={{ display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: '0.2rem' }}>{b.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div style={{ maxWidth: 700 }}>
          <div className="section-header"><h2 className="section-title">Brand Pricing</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[
              { plan: 'Starter', price: '₹500', responses: '250 responses', reward: '2 OP/response', features: ['1 active survey', 'Basic analytics', 'Email support'] },
              { plan: 'Growth', price: '₹2,000', responses: '1,000 responses', reward: '5 OP/response', features: ['5 active surveys', 'Advanced analytics', 'Priority support', 'CSV export'], popular: true },
              { plan: 'Enterprise', price: 'Custom', responses: 'Unlimited', reward: 'Custom reward', features: ['Unlimited surveys', 'API access', 'Dedicated manager', 'White-label option'] },
            ].map((p) => (
              <div key={p.plan} className="card" style={{ textAlign: 'center', border: p.popular ? '2px solid var(--accent)' : '1px solid var(--border)', position: 'relative' }}>
                {p.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '0.2rem 0.8rem', borderRadius: '99px' }}>MOST POPULAR</div>}
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: '0.3rem' }}>{p.plan}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--gold)', marginBottom: '0.2rem' }}>{p.price}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1rem' }}>{p.responses}</div>
                {p.features.map((f) => (
                  <div key={f} style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '0.4rem' }}>✓ {f}</div>
                ))}
                <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} onClick={() => toast.success('Our team will contact you!')}>Get Started</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
