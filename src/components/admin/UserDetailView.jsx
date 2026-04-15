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
  const [activeTab, setActiveTab] = useState('overview');
  const [fullSchedule, setFullSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(null);

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

  const loadFullSchedule = async () => {
    if (fullSchedule) return;
    setScheduleLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}/schedule`);
      setFullSchedule(res.data.data);
    } catch (err) {
      console.error('Failed to fetch full schedule', err);
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadFullSchedule();
    }
  }, [activeTab]);

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

  const handleRegenerate = async (problemId) => {
    if (!window.confirm('Are you sure you want to replace this problem with a new one?')) return;
    setRegenLoading(problemId);
    try {
      await api.post(`/admin/users/${userId}/replace-problem`, { problemId });
      fetchDetail();
      if (activeTab === 'schedule') {
        // Refresh full schedule too
        const res = await api.get(`/admin/users/${userId}/schedule`);
        setFullSchedule(res.data.data);
      }
    } catch (err) {
      console.error('Failed to regenerate problem', err);
      alert('Failed to regenerate: ' + (err.response?.data?.message || err.message));
    } finally {
      setRegenLoading(null);
    }
  };

  const handleRemoveProblem = async (problemId) => {
    if (!window.confirm("Are you sure you want to completely remove this problem from the user's schedule?")) return;
    setRemoveLoading(problemId);
    try {
      await api.post(`/admin/users/${userId}/remove-problem`, { problemId });
      fetchDetail();
      if (activeTab === 'schedule') {
        const res = await api.get(`/admin/users/${userId}/schedule`);
        setFullSchedule(res.data.data);
      }
    } catch (err) {
      console.error('Failed to remove problem', err);
      alert('Failed to remove: ' + (err.response?.data?.message || err.message));
    } finally {
      setRemoveLoading(null);
    }
  };

  const handleBan = async () => {
    if (!window.confirm(`Are you sure you want to ${data.user.isBanned ? 'unban' : 'ban'} ${data.user.name}?`)) return;
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
          src={(user.avatar && user.avatar !== 'null') ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
          alt="" 
          onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`; }}
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: '700', color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', borderBottom: activeTab === 'overview' ? '2px solid var(--primary-color)' : 'none', paddingBottom: '4px' }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: '700', color: activeTab === 'schedule' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', borderBottom: activeTab === 'schedule' ? '2px solid var(--primary-color)' : 'none', paddingBottom: '4px' }}
        >
          Full Schedule (Day-wise)
        </button>
      </div>

      {activeTab === 'overview' ? (
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
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        className="admin-btn-danger"
                        onClick={() => handleRemoveProblem(p._id)}
                        disabled={removeLoading === p._id}
                        title="Delete Problem from Schedule"
                      >
                        {removeLoading === p._id ? '...' : '🗑️'}
                      </button>
                      <button
                        className="admin-btn-neutral"
                        onClick={() => handleRegenerate(p._id)}
                        disabled={regenLoading === p._id}
                        title="Regenerate/Replace Problem"
                      >
                        {regenLoading === p._id ? '...' : '🔄'}
                      </button>
                      <button
                        className={p.solved ? 'admin-btn-danger' : 'admin-btn-success'}
                        onClick={() => handleMarkProblem(p._id, !p.solved)}
                        disabled={markLoading === p._id}
                      >
                        {markLoading === p._id ? '...' : p.solved ? 'Unmark' : 'Mark Solved'}
                      </button>
                    </div>
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
      ) : (
        <div className="admin-schedule-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {scheduleLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading schedule...</div>
          ) : !fullSchedule || fullSchedule.length === 0 ? (
            <div className="admin-section-card">
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>This user does not have an active schedule generated.</p>
            </div>
          ) : (
            fullSchedule.map((day) => (
              <div key={day.dayNumber} className="admin-section-card" style={{ borderLeft: day.allDone ? '4px solid var(--emerald-500)' : '4px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Day {day.dayNumber}</h3>
                    <span className="admin-badge admin-badge-neutral" style={{ textTransform: 'capitalize' }}>{day.type}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(day.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className={`admin-badge ${day.allDone ? 'admin-badge-success' : day.completedCount > 0 ? 'admin-badge-warning' : 'admin-badge-neutral'}`}>
                      {day.completedCount} / {day.problemCount} Completed
                    </span>
                  </div>
                </div>

                {day.problems && day.problems.length > 0 ? (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>Status</th>
                          <th>Problem</th>
                          <th style={{ width: '100px' }}>Difficulty</th>
                          <th style={{ width: '150px' }}>Topic</th>
                          <th style={{ width: '100px' }}>Platform</th>
                          <th style={{ width: '120px' }}>Actions</th>
                          <th style={{ width: '100px' }}>Flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.problems.map((p) => {
                          const prob = p.problemId || p;
                          const isOpt = prob.isOptional || !!(prob.leetcodeSlug && prob.isPremium);
                          return (
                          <tr key={prob._id} style={{ opacity: p.solved ? 0.7 : 1 }}>
                            <td style={{ textAlign: 'center', fontSize: '1.1rem' }}>{p.solved ? '✅' : '⬜'}</td>
                            <td>
                              <div style={{ fontWeight: '600' }}>{prob.name}</div>
                            </td>
                            <td>
                              <span className={`admin-badge ${prob.difficulty === 'Easy' ? 'admin-badge-success' : prob.difficulty === 'Medium' ? 'admin-badge-warning' : 'admin-badge-danger'}`}>
                                {prob.difficulty}
                              </span>
                            </td>
                            <td><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{prob.topic}</span></td>
                            <td>
                              {prob.leetcodeSlug && prob.leetcodeSlug !== 'null' ? (
                                <a href={`https://leetcode.com/problems/${prob.leetcodeSlug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontSize: '0.8rem', textDecoration: 'none' }}>LeetCode ↗</a>
                              ) : prob.gfgUrl && prob.gfgUrl !== 'null' ? (
                                <a href={prob.gfgUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontSize: '0.8rem', textDecoration: 'none' }}>GeeksforGeeks ↗</a>
                              ) : (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>None</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="admin-btn-danger"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  onClick={() => handleRemoveProblem(prob._id)}
                                  disabled={removeLoading === prob._id}
                                  title="Delete problem"
                                >
                                  {removeLoading === prob._id ? '...' : 'Del'}
                                </button>
                                <button
                                  className="admin-btn-neutral"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  onClick={() => handleRegenerate(prob._id)}
                                  disabled={regenLoading === prob._id}
                                  title="Replace with new problem"
                                >
                                  {regenLoading === prob._id ? '...' : 'Regen'}
                                </button>
                                <button
                                  className={p.solved ? 'admin-btn-danger' : 'admin-btn-success'}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  onClick={() => handleMarkProblem(prob._id, !p.solved)}
                                  disabled={markLoading === prob._id}
                                >
                                  {markLoading === prob._id ? '...' : p.solved ? 'Unmark' : 'Mark'}
                                </button>
                              </div>
                            </td>
                            <td>
                              {isOpt && <span className="admin-badge admin-badge-neutral" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Optional</span>}
                              {prob.isPremium && <span className="admin-badge admin-badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px', marginTop: '4px' }}>Premium</span>}
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>No problems assigned for this day.</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetailView;
