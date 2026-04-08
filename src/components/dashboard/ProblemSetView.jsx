import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const ProblemSetView = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    topic: 'All',
    difficulty: 'All',
    search: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    topics: [],
    difficulties: ['Easy', 'Medium', 'Hard']
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });

  const fetchFilters = async () => {
    try {
      const res = await api.get('/problems/filters');
      if (res.data.success) {
        setFilterOptions(prev => ({ ...prev, topics: res.data.data.topics }));
      }
    } catch (err) {
      console.error("Failed to fetch filters", err);
    }
  };

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const { topic, difficulty, search } = filters;
      const res = await api.get('/problems', {
        params: {
          topic: topic === 'All' ? undefined : topic,
          difficulty: difficulty === 'All' ? undefined : difficulty,
          search: search || undefined,
          page: pagination.page
        }
      });
      if (res.data.success) {
        setProblems(res.data.data);
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages
        }));
      }
    } catch (err) {
      console.error("Failed to fetch problems", err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ topic: 'All', difficulty: 'All', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="reveal visible container" style={{ paddingBottom: '100px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '48px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', zIndex: -1 }}></div>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', color: 'white', marginBottom: '12px', letterSpacing: '-0.04em', lineHeight: '1' }}>Problem <span className="gradient-text">Library</span></h1>
        <p style={{ color: 'var(--slate-400)', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', maxWidth: '600px' }}>
          Explore the ultimate collection of DSA challenges. Filter, search, and master patterns one problem at a time.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
          <div style={{ minWidth: '200px', flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Search Problems</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name..." 
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '0.9375rem', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--indigo-500)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <div style={{ minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Concept</label>
            <select 
              name="topic"
              value={filters.topic}
              onChange={handleFilterChange}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '0.9375rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Concepts</option>
              {filterOptions.topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Difficulty</label>
            <select 
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '0.9375rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Difficulties</option>
              {filterOptions.difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={clearFilters}
          style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--slate-300)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'flex-end', marginBottom: '2px' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--slate-300)'; }}
        >
          Reset
        </button>
      </div>

      {/* Problems List */}
      <div className="glass-card" style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concept</th>
                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</th>
                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '80px 0', textAlign: 'center' }}>
                    <div className="loader" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔍</div>
                    <h3 style={{ color: 'white', marginBottom: '8px' }}>No problems found</h3>
                    <p style={{ color: 'var(--slate-500)' }}>Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr key={problem._id} className="problem-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      {problem.isSolved ? (
                        <span style={{ color: 'var(--emerald-500)', fontSize: '1.25rem' }}>check_circle</span>
                      ) : (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', margin: '2px' }}></div>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '700', color: 'white', fontSize: '1rem' }}>{problem.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>{problem.source || 'Standard'}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(99,102,241,0.08)', color: 'var(--indigo-300)', fontSize: '0.8125rem', fontWeight: '600', border: '1px solid rgba(99,102,241,0.15)' }}>
                        {problem.topic}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {problem.leetcodeSlug && (
                          <a 
                            href={`https://leetcode.com/problems/${problem.leetcodeSlug}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-sm btn-ghost"
                            style={{ padding: '6px 12px' }}
                          >
                            LeetCode ↗
                          </a>
                        )}
                        {problem.gfgUrl && (
                          <a 
                            href={problem.gfgUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-sm btn-ghost"
                            style={{ padding: '6px 12px' }}
                          >
                            GFG ↗
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        {!loading && problems.length > 0 && (
          <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
              Showing {problems.length} of {pagination.total} problems
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: pagination.page === 1 ? 'var(--slate-700)' : 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <button 
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: pagination.page >= pagination.pages ? 'var(--slate-700)' : 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .problem-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--indigo-400), var(--emerald-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        select option {
          background: var(--bg-card);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ProblemSetView;
