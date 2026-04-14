import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ActivityHeatmap from '../dashboard/ActivityHeatmap';

const UserDetailView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markLoading, setMarkLoading] = useState(null);
  const [banLoading, setBanLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch user detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [userId]);

  const handleMarkProblem = async (problemId, solved) => {
    setMarkLoading(problemId);
    try {
      await api.post('/admin/mark-problem', { userId, problemId, solved });
      fetchDetail();
    } catch (err) {
      console.error('Failed to mark problem', err);
    } finally {
      setMarkLoading(null);
    }
  };

  const handleBan = async () => {
    if (!confirm(`Are you sure you want to ${data.user.isBanned ? 'unban' : 'ban'} ${data.user.name}?`)) return;
    setBanLoading(true);
    try {
      await api.post(`/admin/users/${userId}/ban`, { reason: 'Admin action' });
      fetchDetail();
    } catch (err) {
      console.error('Failed to toggle ban', err);
    } finally {
      setBanLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!data) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px' }}>User not found.</p>;

  const { user, schedule, todayAssignment, stats, recentActivity } = data;

  return (
    <div className="reveal visible container" style={{ paddingBottom: '60px' }}>
      {/* Back Button */}
      <button className="admin-back-btn" onClick={() => navigate('/admin/users')}>
        ← Back to Users
      </button>

      {/* Profile Header */}
      <div className="admin-section-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <img 
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
          alt="" 
          style={{ width: '56px', height: '56px', borderRadius: '14px', border: '3px solid var(--border-color-strong)' }} 
        />
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{user.name}</h2>
            {user.isAdmin && <span className="admin-badge admin-badge-info">Admin</span>}
            {user.isBanned && <span className="admin-badge admin-badge-danger">Banned</span>}
            {!user.onboardingComplete && <span className="admin-badge admin-badge-warning">Not Onboarded</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>📧 {user.email}</span>
            {user.leetcodeUsername && <span>💻 @{user.leetcodeUsername}</span>}
            <span>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!user.isAdmin && (
            <button className={user.isBanned ? 'admin-btn-success' : 'admin-btn-danger'} onClick={handleBan} disabled={banLoading}>
              {banLoading ? '...' : user.isBanned ? '✅ Unban User' : '🚫 Ban User'}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Streak</div>
          <div className="admin-kpi-value" style={{ color: 'var(--amber-500)', fontSize: '1.5rem' }}>🔥 {user.currentStreak}</div>
          <div className="admin-kpi-sub">Best: {user.longestStreak}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Total Solved</div>
          <div className="admin-kpi-value" style={{ color: 'var(--indigo-500)', fontSize: '1.5rem' }}>{user.realTotalSolved ?? user.totalSolved}</div>
          <div className="admin-kpi-sub">{stats.daysActive} active days</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Daily Goal</div>
          <div className="admin-kpi-value" style={{ color: 'var(--emerald-500)', fontSize: '1.5rem', textTransform: 'capitalize' }}>{user.dailyGoal || 'N/A'}</div>
          <div className="admin-kpi-sub">{schedule ? `${schedule.totalDays} day plan` : 'No schedule'}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Rest Tokens</div>
          <div className="admin-kpi-value" style={{ color: 'var(--slate-400)', fontSize: '1.5rem' }}>{user.restTokens}</div>
          <div className="admin-kpi-sub">remaining</div>
        </div>
      </div>

      <div className="admin-detail-grid">
        {/* Today's Assignment */}
        <div className="admin-section-card">
          <div className="admin-section-title">📋 Today's Assignment</div>
          {todayAssignment ? (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="admin-badge admin-badge-info">Day {todayAssignment.dayNumber}</span>
                <span className="admin-badge admin-badge-neutral" style={{ textTransform: 'capitalize' }}>{todayAssignment.type}</span>
                <span className={`admin-badge ${todayAssignment.allDone ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                  {todayAssignment.totalCompleted}/{todayAssignment.totalAssigned} done
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todayAssignment.problems.map((p) => (
                  <div key={p._id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                    padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    opacity: p.solved ? 0.7 : 1, flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem' }}>{p.solved ? '✅' : '⬜'}</span>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      {p.isCarryover && (
                        <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', background: 'rgba(245,158,11,0.12)', color: 'var(--amber-500)', border: '1px solid rgba(245,158,11,0.3)', letterSpacing: '0.04em' }}>📌 CARRY-OVER</span>
                      )}
                      <span className={`admin-badge ${p.difficulty === 'Easy' ? 'admin-badge-success' : p.difficulty === 'Medium' ? 'admin-badge-warning' : 'admin-badge-danger'}`}>
                        {p.difficulty}
                      </span>
                    </div>
                    <button
                      className={p.solved ? 'admin-btn-danger' : 'admin-btn-success'}
                      onClick={() => handleMarkProblem(p._id, !p.solved)}
                      disabled={markLoading === p._id}
                      style={{ flexShrink: 0 }}
                    >
                      {markLoading === p._id ? '...' : p.solved ? 'Unmark' : 'Mark Solved'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No assignment for today (no schedule or not scheduled today).</p>
          )}
        </div>

        {/* Difficulty Distribution */}
        <div className="admin-section-card">
          <div className="admin-section-title">📊 Difficulty Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Easy', 'Medium', 'Hard'].map((diff) => {
              const count = stats.difficultyDistribution[diff] || 0;
              const max = Math.max(...Object.values(stats.difficultyDistribution), 1);
              const colors = { Easy: 'var(--status-easy)', Medium: 'var(--status-medium)', Hard: 'var(--status-hard)' };
              return (
                <div key={diff}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: colors[diff] }}>{diff}</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{count}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-card)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: colors[diff], borderRadius: '99px', transition: 'width 0.8s ease-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Topic Breakdown */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Topic Progress</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
              {Object.entries(stats.topicBreakdown).length > 0 ? (
                Object.entries(stats.topicBreakdown)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([topic, d]) => (
                    <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-card)' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{topic}</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{d.total}</span>
                    </div>
                  ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No topics solved yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="admin-section-card admin-detail-full">
          <div className="admin-section-title">🗓️ Activity Heatmap</div>
          {Object.keys(stats.heatmap).length > 0 ? (
            <div style={{ overflowX: 'auto', paddingBottom: '8px' }} className="custom-scrollbar">
              <ActivityHeatmap heatmapData={stats.heatmap} />
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No activity data yet.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="admin-section-card admin-detail-full">
          <div className="admin-section-title">🕒 Recent Activity</div>
          {recentActivity.length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day #</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                    <th>Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(a.date).toLocaleDateString()}</td>
                      <td><span style={{ fontWeight: '700', fontFamily: 'Space Grotesk, sans-serif' }}>{a.dayNumber}</span></td>
                      <td>{a.assigned}</td>
                      <td>
                        <span style={{ fontWeight: '700', color: a.completed > 0 ? 'var(--emerald-500)' : 'var(--text-secondary)' }}>{a.completed}</span>
                      </td>
                      <td>{a.notesCount > 0 ? `📝 ${a.notesCount}` : '—'}</td>
                      <td>
                        {a.isRestDay ? (
                          <span className="admin-badge admin-badge-neutral">😴 Rest</span>
                        ) : a.allDone ? (
                          <span className="admin-badge admin-badge-success">✅ Done</span>
                        ) : a.completed > 0 ? (
                          <span className="admin-badge admin-badge-warning">⏳ Partial</span>
                        ) : (
                          <span className="admin-badge admin-badge-neutral">— None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailView;
