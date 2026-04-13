import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const LeaderboardView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('totalSolved');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/leaderboard', { params: { sortBy } });
        setUsers(res.data.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [sortBy]);

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  const sortOptions = [
    { value: 'totalSolved', label: '🏅 Total Solved' },
    { value: 'currentStreak', label: '🔥 Current Streak' },
    { value: 'longestStreak', label: '⚡ Longest Streak' },
  ];

  return (
    <div className="reveal visible container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
          🏆 <span className="gradient-text">Leaderboard</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          Top performers across the platform
        </p>
      </div>

      {/* Sort Selection */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            style={{
              padding: '10px 20px', borderRadius: 'var(--radius)', fontFamily: 'inherit',
              fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
              background: sortBy === opt.value ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: sortBy === opt.value ? 'var(--bg-surface)' : 'var(--text-secondary)',
              border: sortBy === opt.value ? '2px solid var(--accent-primary)' : '2px solid var(--border-color-strong)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {users.length >= 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
              {[1, 0, 2].map((podiumIdx) => {
                const u = users[podiumIdx];
                const medals = ['🥇', '🥈', '🥉'];
                const sizes = [{ h: 160, w: 140 }, { h: 140, w: 130 }, { h: 120, w: 130 }];
                const s = sizes[podiumIdx];
                return (
                  <div 
                    key={u._id}
                    onClick={() => navigate(`/admin/users/${u._id}`)}
                    style={{
                      width: `${s.w}px`, minHeight: `${s.h}px`, padding: '20px 16px',
                      background: 'var(--bg-surface)', border: '2px solid var(--border-color-strong)',
                      borderRadius: '16px', textAlign: 'center', cursor: 'pointer',
                      transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-color-strong)'; }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{medals[podiumIdx]}</div>
                    <img 
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt="" 
                      style={{ width: '44px', height: '44px', borderRadius: '12px', border: '2px solid var(--border-color)', marginBottom: '8px' }}
                    />
                    <div style={{ fontWeight: '800', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{u.name}</div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: '900', fontSize: '1.3rem', color: 'var(--indigo-400)', marginTop: '4px' }}>
                      {sortBy === 'totalSolved' ? (u.realTotalSolved ?? u.totalSolved) : sortBy === 'currentStreak' ? u.currentStreak : u.longestStreak}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                      {sortBy === 'totalSolved' ? 'solved' : 'days'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>User</th>
                  <th>Solved</th>
                  <th>Streak</th>
                  <th>Best Streak</th>
                  <th>Days Active</th>
                  <th>Goal</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} onClick={() => navigate(`/admin/users/${u._id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className={`admin-rank ${getRankClass(u.rank)}`}>
                        {u.rank}
                      </div>
                    </td>
                    <td>
                      <div className="admin-user-cell">
                        <img 
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt="" className="admin-user-avatar" 
                        />
                        <div className="admin-user-info">
                          <span className="admin-user-name">{u.name}</span>
                          <span className="admin-user-email">{u.leetcodeUsername ? `@${u.leetcodeUsername}` : u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--indigo-400)' }}>{u.realTotalSolved ?? u.totalSolved}</span></td>
                    <td>
                      <span style={{ fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: u.currentStreak > 0 ? 'var(--amber-500)' : 'var(--text-secondary)' }}>
                        {u.currentStreak > 0 ? `🔥 ${u.currentStreak}` : '0'}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{u.longestStreak}</span></td>
                    <td><span style={{ fontWeight: '700', color: 'var(--emerald-500)' }}>{u.daysActive}</span></td>
                    <td>
                      <span className={`admin-badge ${u.dailyGoal === 'intense' ? 'admin-badge-danger' : u.dailyGoal === 'medium' ? 'admin-badge-warning' : 'admin-badge-neutral'}`}>
                        {u.dailyGoal || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardView;
