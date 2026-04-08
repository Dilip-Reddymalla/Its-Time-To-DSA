import React from 'react';
import { Link } from 'react-router-dom';

const CTABanner = () => {
  return (
    <section className="section" style={{ padding: '0 24px 100px' }}>
      <div className="container relative overflow-hidden" style={{ borderRadius: '48px', padding: '80px 24px', background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)', boxShadow: '0 40px 100px -20px rgba(79, 70, 229, 0.4)' }}>
        
        {/* Animated background elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '120%', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 70%)', zIndex: 1, filter: 'blur(30px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '30%', height: '100%', background: 'radial-gradient(ellipse at center, var(--border-color) 0%, transparent 70%)', zIndex: 1, filter: 'blur(30px)' }}></div>
        
        <div className="bg-grid" style={{ zIndex: 0, opacity: 0.1 }}></div>

        <div className="reveal visible" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '24px', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
            Ready to <span style={{ color: 'var(--emerald-400)' }}>conquer</span> your grind?
          </h2>
          
          <p style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '48px', maxWidth: '650px', lineHeight: '1.6', fontWeight: '500' }}>
            Join 10,000+ developers leveraging structured patterns and automated tracking to crush their technical interviews.
          </p>

          <Link to="/login" className="btn btn-primary" style={{ background: 'var(--text-primary)', color: '#4f46e5', padding: '20px 48px', fontSize: '1.25rem', fontWeight: '800', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', display: 'flex', alignItems: 'center', gap: '12px' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
            Start Your Journey Free
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', marginTop: '56px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--emerald-400)', fontSize: '1.5rem' }}>✓</span> Totally Free Setup
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--emerald-400)', fontSize: '1.5rem' }}>✓</span> Auto LeetCode Verification
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--emerald-400)', fontSize: '1.5rem' }}>✓</span> Smart Pattern-based Plans
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
