import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ThemeToggle from '../ThemeToggle';
import CommandPalette from './CommandPalette';

const DashboardLayout = () => {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth, location.pathname]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  const navItems = [
    { name: 'Today',       path: '/dashboard/today',    icon: '🏠' },
    { name: 'Progress',    path: '/dashboard/progress', icon: '📊' },
    { name: 'Calendar',    path: '/dashboard/calendar', icon: '📅' },
    { name: 'Problem Set', path: '/dashboard/problems', icon: '📚' },
    { name: 'Journal',     path: '/dashboard/journal',  icon: '📓' },
    { name: 'Profile',     path: '/dashboard/profile',  icon: '👤' },
    ...(user?.isAdmin ? [{ name: 'Admin Panel', path: '/admin/overview', icon: '🛡️' }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', overflow: 'hidden' }}>
      
      {/* Mobile Top Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 20px', 
        height: '64px',
        borderBottom: '1px solid var(--border-color)', 
        background: 'var(--bg-surface)', 
        backdropFilter: 'blur(12px)',
        zIndex: 100 
      }} className="hide-desktop">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo.png" alt="Logo" style={{ 
            width: '48px', height: '48px', borderRadius: '10px',
            border: '1.5px solid rgba(99,102,241,0.5)',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)'
          }} />
          <span style={{ fontWeight: '800', letterSpacing: '-0.02em', fontSize: '1.1rem' }}>Its Time to <span className="gradient-text">DSA</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            style={{ 
              width: '40px', height: '40px', borderRadius: '10px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', 
              fontSize: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' 
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 80 }} 
            className="hide-desktop"
          />
        )}

        {/* Sidebar */}
        <aside style={{
          width: '300px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 90,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          
          {/* Desktop Logo */}
          <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }} className="hide-mobile">
            <img src="/logo.png" alt="Logo" style={{ 
              width: '50%', height: 'auto', borderRadius: '14px',
              border: '2px solid rgba(99,102,241,0.5)',
              boxShadow: '0 0 20px rgba(99,102,241,0.35)',
              display: 'block',
              margin: '0 auto'
            }} />
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
              <span style={{ fontWeight: '900', fontSize: '1.25rem', letterSpacing: '-0.03em', display: 'block', lineHeight: 1.2 }}>Its Time to <span className="gradient-text">DSA</span></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>Mastery Roadmap</span>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', fontWeight: '600', transition: 'all 0.2s', textDecoration: 'none',
                  background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                  color: isActive ? 'var(--indigo-400)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                  fontSize: '1rem'
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ fontSize: '1.25rem', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Card */}
          <div style={{ padding: '24px 16px', marginTop: 'auto', borderTop: '1px solid var(--border-color)', background: 'var(--bg-base)', opacity: 0.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" style={{ width: '44px', height: '44px', borderRadius: '14px', border: '2px solid var(--border-color)', padding: '2px' }} />
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--emerald-500)', border: '2px solid var(--bg-surface)' }}></div>
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                    <kbd style={{ fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--slate-500)', flexShrink: 0, fontFamily: 'sans-serif' }} title="Press Cmd/Ctrl + K to open Command Palette">⌘K</kbd>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>@{user?.leetcodeUsername || 'warrior'}</div>
                </div>
              </div>
              <div className="hide-mobile">
                <ThemeToggle />
              </div>
            </div>
            <button 
              onClick={logout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: 'var(--bg-surface)', color: 'var(--slate-400)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--slate-400)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <span style={{ fontSize: '1.125rem' }}>🚪</span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Viewer */}
        <main style={{ flex: 1, minHeight: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative', background: 'var(--bg-base)', padding: 'clamp(20px, 4vw, 40px)' }} className="dashboard-content">
          <div className="bg-glow-orb" style={{ top: '-100px', right: '-100px', opacity: 0.3, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }}></div>
          <div className="bg-grid" style={{ opacity: 0.05 }}></div>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Outlet />
          </div>
        </main>
      </div>
      
      <CommandPalette />
      
      <style>{`
        @media (max-width: 767px) {
          .sidebar { position: fixed; top: 65px; left: 0; bottom: 0; transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
        }
        .sidebar-link:hover { color: var(--text-primary) !important; background: var(--border-color) !important; border-color: transparent !important; }
        .sidebar-link.active:hover { background: rgba(99,102,241,0.1) !important; border-color: rgba(99,102,241,0.2) !important; color: var(--indigo-400) !important; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
