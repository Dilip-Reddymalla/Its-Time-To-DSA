import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const ReportsView = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  
  const [editingProblem, setEditingProblem] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?status=${statusFilter}&page=${page}&limit=20`);
      if (res.data.success) {
        setReports(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await api.put(`/admin/reports/${id}/resolve`);
      fetchReports();
    } catch (err) {
      alert('Failed to resolve');
    } finally {
      setResolvingId(null);
    }
  };

  const submitProblemEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/problems/${editingProblem._id}`, {
        name: editingProblem.name,
        leetcodeSlug: editingProblem.leetcodeSlug,
        difficulty: editingProblem.difficulty,
        topic: editingProblem.topic,
        isOptional: editingProblem.isOptional
      });
      alert('Problem updated successfully');
      setEditingProblem(null);
      fetchReports();
    } catch (err) {
      alert('Failed to update problem');
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Reports & Issues</h2>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>Triaging user-reported problems.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setStatusFilter('pending'); setPage(1); }} className={`btn ${statusFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 16px' }}>Pending</button>
          <button onClick={() => { setStatusFilter('resolved'); setPage(1); }} className={`btn ${statusFilter === 'resolved' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 16px' }}>Resolved</button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color-strong)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px', color: 'var(--slate-400)', fontWeight: '600' }}>Reported At</th>
              <th style={{ padding: '16px', color: 'var(--slate-400)', fontWeight: '600' }}>Reason</th>
              <th style={{ padding: '16px', color: 'var(--slate-400)', fontWeight: '600' }}>Problem</th>
              <th style={{ padding: '16px', color: 'var(--slate-400)', fontWeight: '600' }}>User</th>
              <th style={{ padding: '16px', color: 'var(--slate-400)', fontWeight: '600' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center' }}>Loading reports...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--slate-500)' }}>No {statusFilter} reports.</td></tr>
            ) : (
              reports.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>
                    {r.reason}
                    {r.description && <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>"{r.description}"</div>}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{r.problemId?.name || 'Deleted Problem'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      {r.problemId?.isOptional && <span style={{ color: 'var(--amber-500)', marginRight: '8px' }}>(Optional)</span>}
                      Slug: {r.problemId?.leetcodeSlug || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{r.userId?.username || 'Unknown'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {r.problemId && (
                        <button onClick={() => setEditingProblem(r.problemId)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Edit Problem</button>
                      )}
                      {statusFilter === 'pending' && (
                        <button onClick={() => handleResolve(r._id)} disabled={resolvingId === r._id} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          {resolvingId === r._id ? 'Resolving...' : 'Resolve'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Problem Edit Modal */}
      {editingProblem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color-strong)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px' }}>Edit Problem: {editingProblem.name}</h3>
            <form onSubmit={submitProblemEdit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', color: 'var(--slate-400)' }}>Name</label>
                <input value={editingProblem.name || ''} onChange={e => setEditingProblem({...editingProblem, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', color: 'var(--slate-400)' }}>LeetCode Slug</label>
                <input value={editingProblem.leetcodeSlug || ''} onChange={e => setEditingProblem({...editingProblem, leetcodeSlug: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', color: 'var(--slate-400)' }}>Difficulty</label>
                  <select value={editingProblem.difficulty} onChange={e => setEditingProblem({...editingProblem, difficulty: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input type="checkbox" checked={editingProblem.isOptional || false} onChange={e => setEditingProblem({...editingProblem, isOptional: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    Mark as Optional
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setEditingProblem(null)} className="btn btn-ghost" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Previous</button>
          <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Next</button>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
