import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/overview');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch admin overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Loading admin overview...</p>
      </div>
    );
  }

  if (!data) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px' }}>Failed to load overview data.</p>;

  const maxTrend = Math.max(...data.dailyActiveTrend.map(d => d.count), 1);

  return (
    <div className="reveal visible container" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
          Admin <span className="gradient-text">Overview</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Platform health at a glance</p>
      </div>

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total Users</div>
          <div className="admin-kpi-value" style={{ color: 'var(--indigo-500)' }}>{data.totalUsers}</div>
          <div className="admin-kpi-sub">{data.onboardedUsers} onboarded</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Active Today</div>
          <div className="admin-kpi-value" style={{ color: 'var(--emerald-500)' }}>{data.activeToday}</div>
          <div className="admin-kpi-sub">{data.totalUsers > 0 ? Math.round((data.activeToday / data.totalUsers) * 100) : 0}% of users</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Completed Today</div>
          <div className="admin-kpi-value" style={{ color: 'var(--status-easy)' }}>{data.completedToday}</div>
          <div className="admin-kpi-sub">{data.inProgressToday} in progress</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Avg Streak</div>
          <div className="admin-kpi-value" style={{ color: 'var(--amber-500)' }}>{data.avgStreak}</div>
          <div className="admin-kpi-sub">Max: {data.maxStreak} days</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Platform Solves</div>
          <div className="admin-kpi-value" style={{ color: 'var(--indigo-400)' }}>{data.totalSolvedPlatform}</div>
          <div className="admin-kpi-sub">Avg {data.avgSolved} per user</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">New This Week</div>
          <div className="admin-kpi-value" style={{ color: 'var(--emerald-400)' }}>{data.newSignups}</div>
          <div className="admin-kpi-sub">{data.totalBanned} banned</div>
        </div>
      </div>

      {/* Daily Active Trend */}
      <div className="admin-section-card">
        <div className="admin-section-title">📈 Daily Active Users (14 Days)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px', padding: '0 4px' }}>
          {data.dailyActiveTrend.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '100%', maxWidth: '32px', borderRadius: '4px 4px 0 0',
                height: `${Math.max(4, (d.count / maxTrend) * 60)}px`,
                background: d.count > 0 ? 'linear-gradient(180deg, var(--indigo-400), var(--indigo-500))' : 'var(--bg-card)',
                transition: 'height 0.5s ease-out',
                opacity: d.count > 0 ? 0.85 : 0.3,
              }} title={`${d.date}: ${d.count} active`}></div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{data.dailyActiveTrend[0]?.date}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{data.dailyActiveTrend[data.dailyActiveTrend.length - 1]?.date}</span>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        <button onClick={() => navigate('/admin/users')} style={{
          padding: '20px', borderRadius: 'var(--radius)', background: 'var(--bg-surface)', border: '2px solid var(--border-color-strong)',
          color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit'
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--indigo-500)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color-strong)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>👥</div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>All Users</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>View & manage all users</div>
        </button>
        <button onClick={() => navigate('/admin/today')} style={{
          padding: '20px', borderRadius: 'var(--radius)', background: 'var(--bg-surface)', border: '2px solid var(--border-color-strong)',
          color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit'
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--emerald-500)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color-strong)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📋</div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Today's Snapshot</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Who completed today?</div>
        </button>
        <button onClick={() => navigate('/admin/leaderboard')} style={{
          padding: '20px', borderRadius: 'var(--radius)', background: 'var(--bg-surface)', border: '2px solid var(--border-color-strong)',
          color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit'
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--amber-500)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color-strong)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Leaderboard</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Top performers</div>
        </button>
        <button onClick={() => navigate('/admin/stats')} style={{
          padding: '20px', borderRadius: 'var(--radius)', background: 'var(--bg-surface)', border: '2px solid var(--border-color-strong)',
          color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit'
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--indigo-400)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color-strong)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📈</div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Platform Stats</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Analytics & trends</div>
        </button>
      </div>
    </div>
  );
};

export default AdminOverview;
