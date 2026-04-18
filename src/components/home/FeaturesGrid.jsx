import React from 'react';

const FeaturesGrid = () => {
  const features = [
    {
      title: '90-Day Adaptive Roadmap',
      desc: 'Get a day-by-day roadmap personalized to your pace. Phase 1 for core topics, Phase 2 for advanced patterns, and built-in revision days.',
      icon: '🗓️',
      color: 'var(--indigo-500)',
      large: true,
      extra: (
        <div className="mock-code" style={{ marginTop: '24px', opacity: 0.8 }}>
          <div style={{ color: 'var(--slate-500)' }}>// Today's Focus: Sliding Window</div>
          <div style={{ color: 'var(--emerald-400)' }}>let windowStart = 0;</div>
          <div style={{ color: 'var(--indigo-400)' }}>for (let windowEnd = 0; windowEnd &lt; arr.length; windowEnd++) &#123;</div>
          <div style={{ marginLeft: '16px', color: 'var(--slate-400)' }}>/* Expand window */</div>
          <div style={{ color: 'var(--indigo-400)' }}>&#125;</div>
        </div>
      )
    },
    {
      title: 'Streak Preservation',
      desc: 'Consistency is everything. We track your progress automatically using LeetCode\'s API. Missing a day? Claim a Grace Period.',
      icon: '🔥',
      color: 'var(--amber-500)'
    },
    {
      title: 'Rest Days & Pacing',
      desc: 'Avoid burnout. Opt-in for Sunday rest days, or request a schedule pause if life gets busy. Your timeline shifts mathematically—no lost progress.',
      icon: '🛋️',
      color: 'var(--emerald-500)'
    },
    {
      title: 'Pattern-First Learning',
      desc: 'Stop memorizing code. We group problems by standard patterns (Two Pointers, Fast & Slow, Top K) so you build intuition.',
      icon: '🧠',
      color: 'var(--indigo-500)'
    },
    {
      title: 'Curated Solution Lab',
      desc: 'Stuck? Every problem comes tied to the best GeeksForGeeks articles and NeetCode/Striver videos. No more searching.',
      icon: '📹',
      color: 'var(--indigo-400)',
      large: true
    }
  ];

  return (
    <section id="features" className="section pb-32" style={{ background: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="section-header reveal" style={{ marginBottom: '64px' }}>
          <h2 className="section-title">Built for <span className="gradient-text">Consistent Mastery</span></h2>
          <p className="section-subtitle">No more tutorial hell. Just a curated schedule, smart tracking, and you putting in the work.</p>
        </div>

        <div className="bento-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '32px' 
        }}>
          {features.map((f, i) => (
            <div key={i} className={`reveal ${f.large ? 'bento-large' : ''}`} style={{ 
              padding: '40px', 
              display: 'flex', 
              flexDirection: 'column', 
              animationDelay: `${i * 0.15}s`,
              background: 'var(--bg-surface)',
              border: `2px solid var(--border-color-strong)`,
              borderRadius: '8px', // Industrial sharp
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              gridColumn: window.innerWidth < 768 ? 'span 1' : (f.large ? 'span 2' : 'span 1')
            }} onMouseOver={e => { 
                e.currentTarget.style.transform = 'translateY(-4px)'; 
                e.currentTarget.style.borderColor = 'var(--text-primary)';
                e.currentTarget.style.boxShadow = '8px 8px 0px var(--border-color)';
            }} onMouseOut={e => { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.borderColor = 'var(--border-color-strong)';
                e.currentTarget.style.boxShadow = 'none';
            }}>
              {/* Corner Accent */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', background: `linear-gradient(135deg, transparent 50%, ${f.color}20 50%)`, borderLeft: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}></div>
              
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '12px', background: 'var(--bg-card)', color: f.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '24px',
                border: '1px solid var(--border-color-strong)'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.0625rem', flex: 1, fontWeight: '500' }}>{f.desc}</p>
              {f.extra}
              
              {/* Hardware Label */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)', fontSize: '0.75rem', color: 'var(--slate-400)', fontFamily: 'var(--mono)', fontWeight: 'bold' }}>
                MODULE_PRTK_00{i+1} // STAT_OK
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
