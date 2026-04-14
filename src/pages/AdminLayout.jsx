import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/admin.css';

const AdminLayout = () => {
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
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      navigate('/dashboard/today');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  const navItems = [
    { name: 'Overview',   path: '/admin/overview',     icon: '📊' },
    { name: 'Reports',    path: '/admin/reports',      icon: '🚨' },
    { name: 'Users',      path: '/admin/users',        icon: '👥' },
    { name: 'Today',      path: '/admin/today',        icon: '📋' },
    { name: 'Leaderboard',path: '/admin/leaderboard',  icon: '🏆' },
    { name: 'Stats',      path: '/admin/stats',        icon: '📈' },
  ];

  const dashboardItems = [
    { name: '← Dashboard', path: '/dashboard/today', icon: '🏠' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', overflow: 'hidden' }}>
      
      {/* Mobile Top Bar */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '0 20px', height: '64px', borderBottom: '1px solid var(--border-color)', 
        background: 'var(--bg-surface)', backdropFilter: 'blur(12px)', zIndex: 100 
      }} className="hide-desktop">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.3rem' }}>🛡️</span>
          <span style={{ fontWeight: '800', letterSpacing: '-0.02em', fontSize: '1.1rem' }}>Admin <span className="gradient-text">Panel</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontSize: '1.25rem', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 80 }} className="hide-desktop" />
        )}

        {/* Sidebar */}
        <aside style={{
          width: '280px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column', zIndex: 90, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          
          {/* Desktop Logo */}
          <div style={{ padding: '28px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border-color)' }} className="hide-mobile">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--indigo-500), var(--emerald-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Admin <span className="gradient-text">Panel</span></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Control Center</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.2s', textDecoration: 'none',
                  background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                  color: isActive ? 'var(--indigo-400)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                  fontSize: '0.9rem'
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ fontSize: '1.1rem', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />
            
            {dashboardItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', fontWeight: '600', textDecoration: 'none',
                  color: 'var(--text-secondary)', border: '1px solid transparent', fontSize: '0.9rem', transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.1rem', opacity: 0.7 }}>{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User Card */}
          <div style={{ padding: '20px 16px', marginTop: 'auto', borderTop: '1px solid var(--border-color)', background: 'var(--bg-base)', opacity: 0.8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '12px', border: '2px solid var(--border-color)' }} />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div className="admin-badge admin-badge-info" style={{ marginTop: '2px' }}>Admin</div>
              </div>
              <div className="hide-mobile"><ThemeToggle /></div>
            </div>
            <button 
              onClick={logout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', background: 'var(--bg-surface)', color: 'var(--slate-400)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--slate-400)'; }}
            >
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, minHeight: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative', background: 'var(--bg-base)', padding: 'clamp(20px, 4vw, 40px)' }} className="dashboard-content">
          <div className="bg-glow-orb" style={{ top: '-100px', right: '-100px', opacity: 0.2, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }}></div>
          <div className="bg-grid" style={{ opacity: 0.03 }}></div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Outlet />
          </div>
        </main>
      </div>
      
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

export default AdminLayout;
