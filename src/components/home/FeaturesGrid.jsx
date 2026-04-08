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
      title: 'Pattern-First Learning',
      desc: 'Stop memorizing code. We group problems by standard patterns (Two Pointers, Fast & Slow, Top K) so you build intuition.',
      icon: '🧠',
      color: 'var(--indigo-500)'
    },
    {
      title: 'Curated Solution Lab',
      desc: 'Stuck? Every problem comes tied to the best GeeksForGeeks articles and NeetCode/Striver videos. No more searching.',
      icon: '📹',
      color: 'var(--emerald-500)',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {features.map((f, i) => (
            <div key={i} className={`glass-card reveal ${f.large ? 'bento-large' : ''}`} style={{ 
              padding: 'clamp(24px, 5vw, 40px)', display: 'flex', flexDirection: 'column', animationDelay: `${i * 0.15}s`,
              border: `1px solid rgba(255,255,255,0.05)`,
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              gridColumn: window.innerWidth < 768 ? 'span 1' : (f.large ? 'span 2' : 'span 1')
            }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.borderColor = f.color; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '16px', background: `${f.color}15`, color: f.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '24px'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: '800', color: 'white', marginBottom: '16px' }}>{f.title}</h3>
              <p style={{ color: 'var(--slate-400)', lineHeight: '1.6', fontSize: '1rem', flex: 1 }}>{f.desc}</p>
              {f.extra}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
