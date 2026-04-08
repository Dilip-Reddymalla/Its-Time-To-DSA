import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const visualRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!visualRef.current) return;
      const x = (e.clientX - window.innerWidth / 2) * 0.015;
      const y = (e.clientY - window.innerHeight / 2) * 0.015;
      visualRef.current.style.transform = `perspective(1200px) rotateY(${x}deg) rotateX(${-y}deg) translateY(${y * 0.5}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const headline = "Stop grinding randomly. Start building mastery.";
  const words = headline.split(' ');

  return (
    <section className="hero" style={{ padding: 'min(15vh, 120px) 0 80px' }}>
      <div className="bg-grid"></div>
      <div className="bg-glow-orb" style={{ top: '-100px', right: '-100px' }}></div>
      
      <div className="container">
        <div className="hero-grid stack-on-mobile" style={{ gap: '64px' }}>
          {/* Left Copy */}
          <div className="hero-content" style={{ textAlign: window.innerWidth < 1024 ? 'center' : 'left' }}>
            <div className="hero-pill reveal" style={{ animationDelay: '0s', margin: window.innerWidth < 1024 ? '0 auto 24px' : '0 0 24px' }}>
              <span className="hero-pill-dot"></span>
              Your daily DSA companion
            </div>
            
            <h1 className="hero-title">
              {words.map((word, i) => (
                <span 
                  key={i} 
                  className="reveal" 
                  style={{ 
                    display: 'inline-block', 
                    marginRight: '0.25em',
                    animation: `slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    animationDelay: `${0.2 + i * 0.08}s`,
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  {word === 'mastery.' ? <span className="gradient-text">{word}</span> : word}
                </span>
              ))}
            </h1>
            
            <p className="hero-desc reveal" style={{ animationDelay: '0.8s', opacity: 0, animation: 'fadeIn 1s ease-out forwards 0.8s', maxWidth: '540px', margin: window.innerWidth < 1024 ? '0 auto 32px' : '0 0 32px' }}>
              Get a personalized DSA roadmap, track your LeetCode submissions automatically, and keep your streak alive — every single day.
            </p>
            
            <div className="hero-ctas reveal" style={{ animationDelay: '1s', opacity: 0, animation: 'fadeIn 1s ease-out forwards 1s', justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start' }}>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Get Started Free</Link>
              <a href="#features" className="btn btn-ghost btn-lg" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Explore Features</a>
            </div>
            
            <div className="hero-social-proof reveal" style={{ animationDelay: '1.2s', opacity: 0, animation: 'fadeIn 1s ease-out forwards 1.2s', justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start' }}>
              <div className="avatars">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anya" alt="User" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" alt="User" />
              </div>
              <span>Trusted by 10,000+ developers</span>
            </div>
          </div>

          {/* Right Hero Mockup */}
          <div className="hero-mockup-wrapper reveal hide-mobile" style={{ animationDelay: '0.5s', opacity: 0, animation: 'fadeIn 1.2s ease-out forwards 0.5s' }}>
            <div 
              className="hero-mockup"
              ref={visualRef}
              style={{ 
                background: 'var(--bg-surface)',
                border: '4px solid var(--border-color-strong)',
                borderRadius: '12px',
                boxShadow: '20px 20px 0px var(--border-color), 0 40px 100px -20px rgba(0,0,0,0.1)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="mockup-header" style={{ background: 'var(--bg-surface)' }}>
                <div className="mac-dot mac-red"></div>
                <div className="mac-dot mac-yellow"></div>
                <div className="mac-dot mac-green"></div>
                <div style={{ marginLeft: '12px', fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '500' }}>its-time-to-dsa.app</div>
              </div>
              
              <div className="mockup-body" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--indigo-400)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>Pattern Day 14</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--amber-500)', fontSize: '2rem', fontWeight: '900' }}>🔥 12</div>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: '600' }}>STREAK</p>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>✓</div>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>Two Sum</div>
                  </div>
                  <span className="badge badge-easy">Easy</span>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-600)' }}>•</div>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>Group Anagrams</div>
                  </div>
                  <span className="badge badge-medium">Medium</span>
                </div>
              </div>
              
              <div className="mock-floating-widget glass" style={{ padding: '20px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                 <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--slate-500)', marginBottom: '10px' }}>PROGRESS</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '100px', height: '8px', background: 'var(--bg-surface)', borderRadius: '99px' }}>
                       <div style={{ width: '65%', height: '100%', background: 'var(--indigo-500)', borderRadius: '99px', boxShadow: '0 0 10px var(--indigo-500)' }}></div>
                    </div>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.875rem' }}>65%</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </section>
  );
};

export default HeroSection;
