import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header 
      className="navbar" 
      style={{ 
        background: scrolled ? 'rgba(6, 8, 12, 0.9)' : 'transparent', 
        borderBottomColor: scrolled ? 'var(--border-color)' : 'transparent',
        height: mobileMenuOpen ? 'auto' : 'var(--header-height)',
        flexDirection: 'column',
        padding: mobileMenuOpen ? '0 0 20px 0' : '0'
      }}
    >
      <div className="container" style={{ height: 'var(--header-height)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Its Time to DSA" style={{ height: '32px', width: 'auto', borderRadius: '8px' }} />
          <span className="hide-mobile">Its Time to <span className="gradient-text">DSA</span></span>
        </Link>
        
        {/* Desktop Links */}
        <nav className="nav-links hide-mobile">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        {/* Global Actions */}
        <div className="nav-actions">
          <Link to="/login" className="nav-login hide-mobile">Sign in</Link>
          <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
          
          {/* Hamburger Toggle */}
          <button 
            className="hide-desktop" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="container hide-desktop" style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '32px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border-color)', margin: '12px 1rem' }}>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: '500' }}>Features</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: '500' }}>How it works</a>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--indigo-400)' }}>Sign in</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
