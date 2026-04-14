import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const UserListView = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('lastActiveAt');
  const [order, setOrder] = useState('desc');
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [banLoading, setBanLoading] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { search, sort, order, filter, page, limit: 20 },
      });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, [search, sort, order, filter]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSort(field);
      setOrder('desc');
    }
  };

  const handleBan = async (userId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to toggle this user\'s ban status?')) return;
    setBanLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/ban`, { reason: 'Admin action' });
      fetchUsers(pagination.page);
    } catch (err) {
      console.error('Failed to ban/unban user', err);
    } finally {
      setBanLoading(null);
    }
  };

  const SortIcon = ({ field }) => {
    if (sort !== field) return <span style={{ opacity: 0.3, fontSize: '0.6rem' }}> ↕</span>;
    return <span style={{ fontSize: '0.6rem' }}> {order === 'desc' ? '↓' : '↑'}</span>;
  };

  const timeAgo = (date) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="reveal visible container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
          User <span className="gradient-text">Management</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          {pagination.total} users total
        </p>
      </div>

      {/* Search & Filters */}
      <div className="admin-search-bar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search by name, email, or LeetCode username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="active">Active Users</option>
          <option value="banned">Banned Users</option>
          <option value="onboarded">Onboarded</option>
          <option value="not-onboarded">Not Onboarded</option>
          <option value="">All</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>User <SortIcon field="name" /></th>
                <th onClick={() => handleSort('totalSolved')}>Solved <SortIcon field="totalSolved" /></th>
                <th onClick={() => handleSort('currentStreak')}>Streak <SortIcon field="currentStreak" /></th>
                <th>Today</th>
                <th onClick={() => handleSort('dailyGoal')}>Goal <SortIcon field="dailyGoal" /></th>
                <th onClick={() => handleSort('lastActiveAt')}>Last Active <SortIcon field="lastActiveAt" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className={u.isBanned ? 'row-banned' : ''} onClick={() => navigate(`/admin/users/${u._id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="admin-user-cell">
                        <img 
                          src={(u.avatar && u.avatar !== 'null') ? u.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} 
                          alt="" 
                          onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`; }}
                          className="admin-user-avatar" 
                        />
                        <div className="admin-user-info">
                          <span className="admin-user-name">
                            {u.name}
                            {u.isAdmin && <span style={{ marginLeft: '6px', fontSize: '0.6rem', color: 'var(--indigo-400)' }}>ADMIN</span>}
                            {u.isBanned && <span style={{ marginLeft: '6px', fontSize: '0.6rem', color: '#f87171' }}>BANNED</span>}
                          </span>
                          <span className="admin-user-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--indigo-400)' }}>{u.realTotalSolved ?? u.totalSolved}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', color: u.currentStreak > 0 ? 'var(--amber-500)' : 'var(--text-secondary)' }}>
                        {u.currentStreak > 0 ? `🔥 ${u.currentStreak}` : '0'}
                      </span>
                    </td>
                    <td>
                      {u.todayProgress ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="admin-progress-bar">
                            <div 
                              className={`admin-progress-fill ${u.todayProgress.allDone ? 'complete' : ''}`}
                              style={{ width: `${u.todayProgress.assignedToday > 0 ? (u.todayProgress.completedToday / u.todayProgress.assignedToday) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {u.todayProgress.completedToday}/{u.todayProgress.assignedToday}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge ${u.dailyGoal === 'intense' ? 'admin-badge-danger' : u.dailyGoal === 'medium' ? 'admin-badge-warning' : 'admin-badge-neutral'}`}>
                        {u.dailyGoal || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{timeAgo(u.lastActiveAt)}</span>
                    </td>
                    <td>
                      {!u.isAdmin && (
                        <button
                          className={u.isBanned ? 'admin-btn-success' : 'admin-btn-danger'}
                          onClick={(e) => handleBan(u._id, e)}
                          disabled={banLoading === u._id}
                        >
                          {banLoading === u._id ? '...' : u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="admin-pagination">
          <button className="admin-page-btn" disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)}>← Prev</button>
          {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
            let pageNum;
            if (pagination.pages <= 7) {
              pageNum = i + 1;
            } else if (pagination.page <= 4) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.pages - 3) {
              pageNum = pagination.pages - 6 + i;
            } else {
              pageNum = pagination.page - 3 + i;
            }
            return (
              <button key={pageNum} className={`admin-page-btn ${pagination.page === pageNum ? 'active' : ''}`} onClick={() => fetchUsers(pageNum)}>
                {pageNum}
              </button>
            );
          })}
          <button className="admin-page-btn" disabled={pagination.page >= pagination.pages} onClick={() => fetchUsers(pagination.page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default UserListView;
