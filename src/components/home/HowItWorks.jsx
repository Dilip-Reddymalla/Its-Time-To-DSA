import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'OAuth Secure Sync',
      desc: 'Sign in with Google to create your secure profile. We link your learning journey to your unique developer identity.',
      icon: '🔐'
    },
    {
      step: '02',
      title: 'Architect Your Plan',
      desc: 'Define your goals, daily commitment, and target topics. Our engine builds a custom 90-day roadmap tailored to you.',
      icon: '🎨'
    },
    {
      step: '03',
      title: 'The Daily Grind',
      desc: 'Receive your daily patterns, solve problems on LeetCode, and verify your progress with a single click.',
      icon: '⚙️'
    },
    {
      step: '04',
      title: 'Consistent Mastery',
      desc: 'Watch your streak grow and your skills sharpen with deep analytics and GitHub-style activity tracking.',
      icon: '🏆'
    }
  ];

  return (
    <section id="how-it-works" className="section pt-32 pb-32" style={{ background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-glow-orb" style={{ bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'rgba(16, 185, 129, 0.05)' }}></div>
      
      <div className="container">
        <div className="section-header reveal" style={{ marginBottom: '80px' }}>
          <h2 className="section-title">The Path to <span className="gradient-text">Pattern Mastery</span></h2>
          <p className="section-subtitle">A streamlined, distraction-free workflow designed for the modern developer.</p>
        </div>

        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '32px' 
        }}>
          {steps.map((item, idx) => (
            <div key={idx} className="reveal" style={{ animationDelay: `${idx * 0.15}s`, position: 'relative' }}>
              <div className="glass-card" style={{ 
                height: '100%', 
                padding: 'clamp(24px, 5vw, 40px) 32px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center', 
                transition: 'all 0.3s ease' 
              }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}>
                <div style={{ 
                  width: '72px', height: '72px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--indigo-400)', letterSpacing: '0.15em', marginBottom: '12px' }}>STEP {item.step}</div>
                <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: '800', marginBottom: '16px', color: 'white' }}>{item.title}</h3>
                <p style={{ color: 'var(--slate-400)', fontSize: '0.9375rem', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
