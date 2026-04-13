import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const TodaySnapshotView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('completed');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/today');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch today snapshot', err);
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
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Checking today's status...</p>
      </div>
    );
  }

  if (!data) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px' }}>Failed to load snapshot.</p>;

  const { summary, completed, inProgress, inactive } = data;

  const tabData = {
    completed: { list: completed, emptyMsg: 'No one has completed yet today.', icon: '✅' },
    inProgress: { list: inProgress, emptyMsg: 'No users in progress right now.', icon: '⏳' },
    inactive: { list: inactive, emptyMsg: 'Everyone has been active!', icon: '😴' },
  };

  const current = tabData[activeTab];

  // Completion ring
  const completionPct = summary.completionRate;
  const ringSize = 120;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="reveal visible container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
          Today's <span className="gradient-text">Snapshot</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          {data.date} — {summary.totalUsers} active users tracked
        </p>
      </div>

      {/* Summary Banner */}
      <div className="admin-section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', flex: '1 1 300px' }}>
          {/* Completion Ring */}
          <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
            <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
              <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" stroke="var(--bg-card)" strokeWidth={strokeWidth} />
              <circle 
                cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" 
                stroke={completionPct >= 75 ? 'var(--emerald-500)' : completionPct >= 40 ? 'var(--amber-500)' : 'var(--status-hard)'}
                strokeWidth={strokeWidth} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: '900', fontSize: '1.3rem', color: 'var(--text-primary)' }}>{completionPct}%</span>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: '900', fontSize: '1.3rem', marginBottom: '4px' }}>
              {summary.completed} of {summary.totalUsers} Completed
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {summary.inProgress} in progress · {summary.inactive} inactive
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--emerald-500)' }}>{summary.completed}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Done</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--amber-500)' }}>{summary.inProgress}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Working</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--slate-400)' }}>{summary.inactive}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inactive</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tab-bar">
        <button className={`admin-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          ✅ Completed ({completed.length})
        </button>
        <button className={`admin-tab ${activeTab === 'inProgress' ? 'active' : ''}`} onClick={() => setActiveTab('inProgress')}>
          ⏳ In Progress ({inProgress.length})
        </button>
        <button className={`admin-tab ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>
          😴 Inactive ({inactive.length})
        </button>
      </div>

      {/* List */}
      <div className="admin-section-card" style={{ padding: 0, overflow: 'hidden' }}>
        {current.list.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{current.icon}</div>
            {current.emptyMsg}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {current.list.map((u, idx) => (
              <div 
                key={u._id} 
                onClick={() => navigate(`/admin/users/${u._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px',
                  borderBottom: idx < current.list.length - 1 ? '1px solid var(--border-color)' : 'none',
                  cursor: 'pointer', transition: 'background 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <img 
                  src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} 
                  alt="" 
                  style={{ width: '38px', height: '38px', borderRadius: '10px', border: '2px solid var(--border-color)', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {u.leetcodeUsername ? `@${u.leetcodeUsername}` : u.email}
                    {u.dayNumber && <span> · Day {u.dayNumber}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  {u.assignedCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="admin-progress-bar" style={{ width: '80px' }}>
                        <div 
                          className={`admin-progress-fill ${u.allDone ? 'complete' : ''}`}
                          style={{ width: `${(u.completedCount / u.assignedCount) * 100}%` }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {u.completedCount}/{u.assignedCount}
                      </span>
                    </div>
                  )}
                  {u.currentStreak > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--amber-500)' }}>🔥{u.currentStreak}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySnapshotView;
