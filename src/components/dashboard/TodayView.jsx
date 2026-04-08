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
        
        // Trigger confetti if all problems are solved for the first time this session
        if (res.data.data.progress.completed === res.data.data.progress.total && res.data.data.progress.total > 0) {
          triggerConfetti();
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
  }, [retryCount, error, user?.onboardingComplete]);

  useEffect(() => {
    fetchToday(retryCount > 0);
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [retryCount, user?.onboardingComplete, error]);

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

  if (loading && retryCount === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '24px', color: 'var(--slate-400)', fontSize: '0.875rem' }}>Loading your mission...</p>
      </div>
    );
  }

  if (retryCount > 0 && !scheduleData && !error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader"></div>
        <h3 style={{ marginTop: '24px', color: 'white', fontWeight: '800' }}>Building your roadmap...</h3>
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

  if (error === 'NO_SCHEDULE') {
    return (
      <div className="reveal visible" style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🧭</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px' }}>Choose Your Path</h2>
        <p style={{ color: 'var(--slate-400)', marginBottom: '32px', fontSize: '1.2rem' }}>
          You haven't initialized your 90-day roadmap yet. Let's set your goals and get started.
        </p>
        <Link to="/onboarding" className="btn btn-primary btn-lg">Start Onboarding Flow</Link>
      </div>
    );
  }

  if (!scheduleData) return null;

  const { problems, dayNumber, type, progress, concepts, readings, estimatedTime, isCompleted } = scheduleData;
  const isRevision = type === 'revision' || type === 'mixed';
  const progressPercent = Math.round((progress.completed / progress.total) * 100) || 0;

  return (
    <div className="reveal visible container" style={{ paddingBottom: '80px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
      
      {/* 2-Column Grid */}
      <div className="dashboard-grid reveal visible">
        
        {/* LEFT COLUMN: Mission & Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: '1.6' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="glass" style={{ padding: '6px 16px', borderRadius: '99px', fontSize: '0.8125rem', fontWeight: '800', color: 'var(--indigo-400)', textTransform: 'uppercase' }}>
                Day {dayNumber} of 90
              </span>
              {isRevision && <span className="glass" style={{ padding: '6px 16px', borderRadius: '99px', fontSize: '0.8125rem', fontWeight: '800', color: 'var(--emerald-400)', textTransform: 'uppercase' }}>Revision Mode</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
              {isRevision ? 'Strengthen Your Patterns' : "Today's Daily Mission"}
            </h1>
            <p style={{ color: 'var(--slate-400)', fontSize: 'clamp(0.9rem, 2vw, 1.125rem)' }}>
              Focus Area: <span style={{ color: 'white', fontWeight: '600' }}>{concepts.join(', ')}</span>
            </p>
          </div>

          {/* Progress Bar (Detailed) */}
          <div className="glass-card" style={{ padding: '24px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--slate-400)' }}>Overall Daily Progress</span>
                <span style={{ color: 'var(--emerald-400)', fontWeight: 'bold' }}>{progress.completed}/{progress.total} Solved</span>
             </div>
             <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--emerald-500), var(--emerald-400))', width: `${progressPercent}%`, transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}></div>
             </div>
          </div>

          {/* Problem List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {problems.map((p) => (
              <div key={p.slug} className="glass-card stack-on-mobile" style={{ 
                padding: 'clamp(16px, 4vw, 24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                border: p.solved ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)',
                background: p.solved ? 'rgba(16,185,129,0.02)' : 'rgba(255,255,255,0.02)',
                gap: '16px'
              }} >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', alignSelf: 'flex-start' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: p.solved ? 'var(--emerald-500)' : 'rgba(255,255,255,0.03)',
                    color: p.solved ? 'white' : 'var(--slate-600)',
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}>
                    {p.solved ? '✓' : '•'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: p.solved ? 'var(--slate-500)' : 'white', textDecoration: p.solved ? 'line-through' : 'none' }}>{p.name}</h3>
                      <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                      {p.isRevision && <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald-400)' }}>Revision</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8125rem', color: 'var(--slate-500)', flexWrap: 'wrap' }}>
                      <span>{p.topic}</span>
                      <span className="hide-mobile">•</span>
                      <a 
                        href={`https://leetcode.com/problems/${p.leetcodeSlug}`} 
                        target="_blank" rel="noreferrer" 
                        style={{ color: 'var(--indigo-400)', fontWeight: 'bold' }}
                      >Open LeetCode ↗</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resources */}
          {readings?.length > 0 && (
            <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 32px)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Curated Learning Resources</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {readings.map((res, i) => (
                  <div key={i} className="btn btn-ghost" style={{ borderRadius: '12px', padding: '12px 20px', fontSize: '0.875rem' }}>
                    📖 {res.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Stats & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '1' }}>
          
          {/* Summary Card */}
          <div className="glass-card" style={{ padding: 'clamp(24px, 6vw, 40px)', textAlign: 'center' }}>
            
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
              <CircularProgress value={progressPercent} />
            </div>

            <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--amber-500)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Current Streak</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <span>🔥</span> {user?.currentStreak || 0}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Est. Commitment</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{estimatedTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Daily Goal</span>
                <span style={{ color: 'white', fontWeight: '600', textTransform: 'capitalize' }}>{user?.dailyGoal}</span>
              </div>
            </div>

            <button 
              onClick={handleSync} 
              disabled={syncing} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
            >
              {syncing ? '⌛ Syncing...' : (
                <>
                  <span>🔄 Verify with LeetCode</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                </>
              )}
            </button>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 'bold', color: 'var(--slate-500)', marginBottom: '12px' }}>Next Up</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--indigo-500)' }}></div>
               <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Day {dayNumber + 1}: {isRevision ? 'Back to Patterns' : 'More Problems'}</span>
            </div>
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
