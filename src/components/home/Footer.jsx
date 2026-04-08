import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-base)', padding: 'min(80px, 10vw) 0 40px' }}>
      <div className="container">
        <div className="stack-on-mobile" style={{ justifyContent: 'space-between', gap: '64px', marginBottom: '64px' }}>
          
          <div style={{ maxWidth: '340px' }}>
            <Link to="/" className="nav-brand" style={{ marginBottom: '24px' }}>
              <div className="nav-logo" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>T</div>
              <span>It's Time To <span className="gradient-text">DSA</span></span>
            </Link>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
              Your daily companion for mastering Data Structures and Algorithms. Build consistency, one problem at a time.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '48px' }}>
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: '800', marginBottom: '20px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Product</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#features" style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Features</a></li>
                <li><a href="#how-it-works" style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>How it works</a></li>
                <li><Link to="/login" style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: '800', marginBottom: '20px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Resources</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="https://leetcode.com" target="_blank" rel="noreferrer" style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>LeetCode</a></li>
                <li><a href="https://takeuforward.org" target="_blank" rel="noreferrer" style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Striver A2Z</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
          <p>© {new Date().getFullYear()} It's Time To DSA. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <p>Built for the developer community</p>
            <a href="#" style={{ color: 'var(--slate-600)' }}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
