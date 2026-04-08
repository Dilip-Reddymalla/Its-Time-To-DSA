import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import CircularProgress from '../ui/CircularProgress';
import confetti from 'canvas-confetti';

const TodayView = () => {
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [tomorrowPreview, setTomorrowPreview] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const pollingRef = React.useRef(null);

  const fetchToday = useCallback(async (isRetry = false) => {
    if (!user?.onboardingComplete) {
      setError('NO_SCHEDULE');
      setLoading(false);
      return;
    }

    if (!isRetry) setLoading(true);
    if (error === 'NO_SCHEDULE') return;

    try {
      const res = await api.get('/schedule/today');
      if (res.data.success) {
        setScheduleData(res.data.data);
        setError(null);
        
        // Fetch tomorrow preview if today is fully completed
        if (res.data.data.progress.completed === res.data.data.progress.total && res.data.data.progress.total > 0) {
          triggerConfetti();
          try {
            const tmrwRes = await api.get('/schedule/tomorrow-preview');
            if (tmrwRes.data.success) setTomorrowPreview(tmrwRes.data.data);
          } catch(e){}
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.code;

      if (status === 404) {
        if (code === 'NO_DAY_ENTRY') {
          setError('NO_DAY_ENTRY');
        } else {
          if (retryCount < 3) {
            if (pollingRef.current) clearTimeout(pollingRef.current);
            pollingRef.current = setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 4000);
          } else {
            setError('NO_SCHEDULE');
          }
        }
      } else {
        setError('FETCH_ERROR');
      }
    } finally {
      if (!pollingRef.current) setLoading(false);
    }
  }, [retryCount, error, user?.onboardingComplete, user?.startDate]);

  useEffect(() => {
    fetchToday(retryCount > 0);
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [retryCount, user?.onboardingComplete, user?.startDate, error, fetchToday]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b']
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/verify');
      if (res.data.success) {
        await fetchToday(true);
        await checkAuth(); 
      }
    } catch (err) {
      alert("Verification failed. Check your LeetCode submissions!");
    } finally {
      setSyncing(false);
    }
  };

  const toggleProblem = async (p) => {
    // Must have _id or problemId
    const targetId = p._id || p.problemId || p.slug; // robust fallback
    if (!targetId) return;

    // LeetCode problems MUST be verified via API, manual toggle disabled
    if (p.leetcodeSlug) {
      alert("LeetCode problems are verified automatically. Please use the 'Verify LeetCode' button.");
      return;
    }

    // Optimistic UI mutation
    const isSolved = !p.solved;
    setScheduleData(prev => {
      const next = { ...prev };
      next.problems = next.problems.map(x => x.slug === p.slug ? { ...x, solved: isSolved } : x);
      next.progress.completed += isSolved ? 1 : -1;
      if (next.progress.completed === next.progress.total) next.progress.allDone = true;
      else next.progress.allDone = false;
      return next;
    });

    try {
      await api.patch('/progress/mark', { problemId: targetId, solved: isSolved });
    } catch (err) {
      await fetchToday(true); // revert
    }
  };

  if (loading && retryCount === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '24px', color: 'var(--slate-400)' }}>Syncing your mission...</p>
      </div>
    );
  }

  if (retryCount > 0 && !scheduleData && !error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader"></div>
        <h3 style={{ marginTop: '24px', color: 'var(--text-primary)', fontWeight: '800' }}>Building your roadmap...</h3>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', marginTop: '8px' }}>Optimizing patterns for Day {user?.startDate ? '1' : '...'}</p>
      </div>
    );
  }

  if (error === 'NO_DAY_ENTRY') {
    return (
      <div className="reveal visible" style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛋️</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px' }}>Rest & Reflect</h2>
        <p style={{ color: 'var(--slate-400)', marginBottom: '32px', fontSize: '1.2rem', lineHeight: '1.6' }}>
          No active missions today. This is the perfect time to review your older bookmarks or take a complete break to avoid burnout.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/dashboard/calendar" className="btn btn-primary" style={{ padding: '14px 28px' }}>Browse Roadmap</Link>
          <button onClick={() => { setRetryCount(0); setError(null); }} className="btn btn-ghost" style={{ padding: '14px 28px' }}>Check Again</button>
        </div>
      </div>
    );
  }

  if (error || !scheduleData) {
    return (
      <div className="reveal visible" style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}> ⚠️ </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px' }}>System Offline</h2>
        <p style={{ color: 'var(--slate-400)', marginBottom: '32px', fontSize: '1.2rem', lineHeight: '1.6' }}>
          We couldn't initialize your schedule. This usually happens if you haven't finished the onboarding flow.
        </p>
        <Link to="/onboarding" className="btn btn-primary" style={{ padding: '16px 32px' }}>Resume Onboarding</Link>
      </div>
    );
  }

  const { problems, progress, dayNumber, isRevision } = scheduleData;
  const progressPercent = Math.round((progress.completed / progress.total) * 100) || 0;
  const accentColor = isRevision ? 'var(--emerald-500)' : 'var(--indigo-500)';

  return (
    <div className="reveal visible container" style={{ paddingBottom: '80px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span className="badge badge-primary" style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}>
            {isRevision ? 'REVISION DAY' : `MISSION DAY ${dayNumber}`}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)', fontWeight: '600' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.04em', lineHeight: '1' }}>
          Today's <span className="gradient-text">Patterns</span>
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '500px', lineHeight: '1.5' }}>
          {isRevision ? "Reviewing previously solved patterns to build long-term muscle memory." : "Mastering the sliding window and two-pointer patterns through deliberate practice."}
        </p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
        {/* Problems List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {problems.map((p, i) => (
            <div key={p.slug || i} className="glass-card problem-card-hover" style={{ 
              padding: '24px', background: p.solved ? 'var(--bg-surface)' : 'var(--bg-card)', opacity: p.solved ? 0.7 : 1, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: p.solved ? '1px solid var(--border-color)' : '2px solid var(--border-color-strong)',
              display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', overflow: 'hidden'
            }}>
              <div 
                onClick={() => toggleProblem(p)}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: p.solved ? accentColor : 'var(--bg-surface)',
                  color: p.solved ? 'var(--bg-base)' : 'var(--slate-600)',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                  opacity: p.leetcodeSlug ? 0.8 : 1,
                  cursor: p.leetcodeSlug ? 'not-allowed' : 'pointer'
                }}
              >
                {p.solved ? '✓' : (p.leetcodeSlug ? '🔒' : '')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{p.title}</h3>
                  <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={p.url || p.leetcodeLink || `https://leetcode.com/problems/${p.leetcodeSlug || p.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--indigo-400)', fontWeight: '600', textDecoration: 'none' }}>Solve on {p.leetcodeSlug ? 'LeetCode' : 'Platform'} ↗</a>
                  {(p.videoSolution || p.gfgLink) && (
                    <a href={p.videoSolution || p.gfgLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: '600', textDecoration: 'none' }}>Solution ↗</a>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* GFG Disclaimer if needed */}
          {problems.some(p => !p.leetcodeSlug) && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', fontSize: '0.8125rem', color: 'var(--amber-500)', textAlign: 'left', lineHeight: '1.5' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Manual Tracking Required</strong>
              GeeksForGeeks and custom problems cannot be auto-verified via LeetCode sync. Please check them off manually by clicking the checkbox on the problem card.
            </div>
          )}
        </div>

        {/* Sidebar / Stats Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Daily Progress Card */}
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-card)', border: '2px solid var(--border-color-strong)' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Progress</h4>
            <div style={{ margin: '0 auto 24px' }}>
              <CircularProgress value={progressPercent} size={140} strokeWidth={12} color={accentColor} />
            </div>
            <button 
              onClick={handleSync} 
              disabled={syncing}
              className={`btn ${syncing ? 'btn-ghost' : 'btn-primary'} btn-sm w-full`}
              style={{ borderRadius: '12px', height: '44px' }}
            >
              {syncing ? 'Verifying...' : 'Verify LeetCode Sync'}
            </button>
          </div>

          <div className="glass-card" style={{ padding: '24px', border: '2px solid var(--border-color-strong)' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mission Intel</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Total Completed</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{user?.totalSolved || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Current Streak</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{user?.currentStreak || 0} Days</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', border: '2px solid var(--border-color-strong)' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Up</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--indigo-500)' }}></div>
               <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>Day {dayNumber + 1}: {isRevision ? 'Back to Patterns' : 'More Problems'}</span>
            </div>
            
            {/* Phase 3 Zeigarnik Effect Preview */}
            {progressPercent === 100 && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', position: 'relative' }}>
                <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Tomorrow's Blueprint</h5>
                <div style={{ filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600' }}>Binary Search Trees</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600' }}>Dynamic Programming I</div>
                </div>
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-surface)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.7rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                  LOCKED
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1.6fr 1fr !important; }
        }
        .reveal { animation: slideIn 0.6s ease-out forwards; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default TodayView;
