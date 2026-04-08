import React, { useState } from 'react';

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <section className="section bg-base relative overflow-hidden">
      <div className="bg-glow-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', opacity: 0.5 }}></div>

      <div className="container relative z-10">
        <div className="section-header reveal">
          <h2 className="section-title">A dashboard you'll actually want to look at</h2>
          <p className="section-subtitle">Dark mode, glassmorphism, and everything exactly where you need it.</p>
        </div>

        {/* Tabs */}
        <div className="reveal stagger-1 flex-center" style={{ gap: '8px', marginBottom: '32px' }}>
          {['today', 'progress', 'calendar'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: activeTab === tab ? '2px solid var(--text-primary)' : '2px solid var(--border-color)',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.875rem',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--slate-500)',
                background: activeTab === tab ? 'var(--bg-surface)' : 'var(--bg-card)',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} View
            </button>
          ))}
        </div>

        {/* Dashboard Mockup Window */}
        <div className="hero-mockup mx-auto reveal stagger-2" style={{ maxWidth: '1000px', aspectRatio: 'auto', transform: 'none' }}>
          
          <div className="mockup-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="mac-dot mac-red"></div>
              <div className="mac-dot mac-yellow"></div>
              <div className="mac-dot mac-green"></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 60px', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--slate-500)' }}>
              dashboard.itstimetodsa.com
            </div>
            <div style={{ width: '48px' }}></div>
          </div>

          <div style={{ display: 'flex', height: '500px' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', borderRight: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }} className="hidden lg-flex">
              <div style={{ color: 'var(--indigo-400)', fontWeight: 'bold', fontSize: '1.25rem' }}>It's Time To DSA</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px 12px', borderRadius: '6px', border: activeTab === 'today' ? '1px solid var(--border-color-strong)' : '1px solid transparent', background: activeTab === 'today' ? 'var(--bg-surface)' : 'transparent', color: activeTab === 'today' ? 'var(--text-primary)' : 'var(--slate-500)', fontWeight: '700', fontSize: '0.875rem' }}>🏠 Today</div>
                <div style={{ padding: '10px 12px', borderRadius: '6px', border: activeTab === 'progress' ? '1px solid var(--border-color-strong)' : '1px solid transparent', background: activeTab === 'progress' ? 'var(--bg-surface)' : 'transparent', color: activeTab === 'progress' ? 'var(--text-primary)' : 'var(--slate-500)', fontWeight: '700', fontSize: '0.875rem' }}>📊 Progress</div>
                <div style={{ padding: '10px 12px', borderRadius: '6px', border: activeTab === 'calendar' ? '1px solid var(--border-color-strong)' : '1px solid transparent', background: activeTab === 'calendar' ? 'var(--bg-surface)' : 'transparent', color: activeTab === 'today' ? 'var(--text-primary)' : 'var(--slate-500)', fontWeight: '700', fontSize: '0.875rem' }}>📅 Calendar</div>
              </div>

              <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}>Phase 1</div>
                <div style={{ color: 'var(--slate-300)', fontSize: '0.75rem' }}>22% Complete</div>
              </div>
            </div>

            {/* Main Area */}
            <div style={{ flex: 1, padding: '40px', background: 'var(--bg-card)', position: 'relative', overflow: 'hidden' }}>
              {activeTab === 'today' && (
                <>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>Welcome back, Developer! 👋</h3>
                  <p style={{ color: 'var(--slate-400)', marginBottom: '32px' }}>You're on a 14-day streak. Keep it up.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div className="bento-card" style={{ padding: '20px' }}>
                      <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem', marginBottom: '4px' }}>Daily Topic</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>Two Pointers</div>
                    </div>
                    <div className="bento-card" style={{ padding: '20px' }}>
                      <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem', marginBottom: '4px' }}>Time Estimated</div>
                      <div style={{ color: 'var(--amber-400)', fontWeight: 'bold', fontSize: '1.25rem' }}>45 mins</div>
                    </div>
                  </div>

                  <div className="bento-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: '500' }}>Container With Most Water</div>
                      <span className="badge badge-medium">Medium</span>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>You have not solved this yet today on LeetCode.</div>
                      <button className="btn btn-primary btn-sm">Verify</button>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'progress' && (
                <>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)' }}>Your Analytics</h3>
                  <div className="bento-card" style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '24px' }}>
                    <div style={{ width: '40px', height: '30%', background: 'var(--indigo-500)', borderRadius: '4px 4px 0 0', opacity: 0.5 }}></div>
                    <div style={{ width: '40px', height: '60%', background: 'var(--indigo-500)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                    <div style={{ width: '40px', height: '40%', background: 'var(--indigo-500)', borderRadius: '4px 4px 0 0', opacity: 0.6 }}></div>
                    <div style={{ width: '40px', height: '90%', background: 'var(--indigo-500)', borderRadius: '4px 4px 0 0', boxShadow: 'var(--shadow-glow)' }}></div>
                    <div style={{ width: '40px', height: '50%', background: 'var(--indigo-500)', borderRadius: '4px 4px 0 0', opacity: 0.7 }}></div>
                  </div>
                </>
              )}
              {activeTab === 'calendar' && (
                <>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)' }}>90-Day Roadmap</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {Array.from({length: 28}).map((_, i) => (
                      <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', background: i < 14 ? 'rgba(16,185,129,0.2)' : i === 14 ? 'var(--indigo-500)' : 'var(--border-color)', border: i === 14 ? '1px solid var(--indigo-400)' : 'none', boxShadow: i === 14 ? 'var(--shadow-glow)' : 'none' }}></div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
