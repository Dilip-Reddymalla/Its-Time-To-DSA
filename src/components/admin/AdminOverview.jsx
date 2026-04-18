import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pauseStatus, setPauseStatus] = useState({ isPaused: false, pauseHistory: [] });
  const [pauseRequests, setPauseRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, pauseStatusRes, pauseReqsRes] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/pause-status'),
          api.get('/admin/pause-requests')
        ]);
        setData(overviewRes.data.data);
        setPauseStatus(pauseStatusRes.data.data);
        setPauseRequests(pauseReqsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleGlobalPauseToggle = async () => {
    const isPausing = !pauseStatus.isPaused;
    let reason = '';
    
    if (isPausing) {
      reason = window.prompt("Enter a reason for pausing the global schedule (users will see this):", "Platform maintenance");
      if (reason === null) return; // user cancelled
    } else {
      if (!window.confirm("Are you sure you want to RESUME the schedule? This will shift all future dates for everyone!")) return;
    }

    try {
      const res = await api.post('/admin/pause-status', { isPaused: isPausing, reason });
      if (res.data.success) {
        setPauseStatus(res.data.data);
        alert(`Global schedule ${isPausing ? 'paused' : 'resumed'} successfully.`);
      }
    } catch (err) {
       alert("Failed to toggle global pause.");
    }
  };

  const handleResolvePauseRequest = async (id, status) => {
     try {
       const res = await api.put(`/admin/pause-requests/${id}`, { status });
       if (res.data.success) {
         alert(`Pause request ${status}.`);
         setPauseRequests(prev => prev.filter(r => r._id !== id));
       }
     } catch(e) {
       alert("Failed to resolve request.");
     }
  };

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
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
            Admin <span className="gradient-text">Overview</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Platform health at a glance</p>
        </div>
        
        {/* Global Pause Control */}
        <div style={{ padding: '16px', borderRadius: '12px', background: pauseStatus.isPaused ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${pauseStatus.isPaused ? '#ef4444' : '#10b981'}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 'bold', color: pauseStatus.isPaused ? '#ef4444' : '#10b981' }}>
              {pauseStatus.isPaused ? '⏸️ PLATFORM PAUSED' : '▶️ PLATFORM ACTIVE'}
            </div>
            {pauseStatus.isPaused && <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Reason: {pauseStatus.pauseReason}</div>}
          </div>
          <button 
             onClick={handleGlobalPauseToggle}
             className="btn btn-sm"
             style={{ background: pauseStatus.isPaused ? '#10b981' : '#ef4444', color: 'white', border: 'none' }}
          >
            {pauseStatus.isPaused ? 'Resume Schedule' : 'Pause Schedule'}
          </button>
        </div>
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

      {/* Pause Requests */}
      <div className="admin-section-card" style={{ marginTop: '32px' }}>
         <div className="admin-section-title">
            ⏸️ Pending Pause Requests ({pauseRequests.length})
         </div>
         {pauseRequests.length === 0 ? (
           <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>No pending pause requests.</p>
         ) : (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {pauseRequests.map(req => (
               <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                 <div>
                   <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{req.userId?.name} <span style={{ color: 'var(--slate-500)', fontWeight: 'normal', fontSize: '0.875rem' }}>({req.userId?.email})</span></div>
                   <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)', marginTop: '4px' }}>Reason: {req.reason}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>Requested at: {new Date(req.requestedAt).toLocaleString()}</div>
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <button className="btn btn-sm btn-ghost" onClick={() => handleResolvePauseRequest(req._id, 'rejected')} style={{ color: 'var(--status-hard)', border: '1px solid var(--status-hard)' }}>Deny</button>
                   <button className="btn btn-sm btn-primary" onClick={() => handleResolvePauseRequest(req._id, 'approved')} style={{ background: 'var(--status-easy)' }}>Approve</button>
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
};

export default AdminOverview;
