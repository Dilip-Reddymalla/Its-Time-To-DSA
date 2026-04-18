import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import CircularProgress from '../ui/CircularProgress';
import ProblemLink from '../ui/ProblemLink';
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
  // notes: { [problemId]: string }
  const [notes, setNotes] = useState({});
  // expandedNote: problemId that currently has the note editor open
  const [expandedNote, setExpandedNote] = useState(null);
  const [savingNote, setSavingNote] = useState(null); // problemId being saved
  
  const [replacingProblem, setReplacingProblem] = useState(null);
  const [reportModalProblemId, setReportModalProblemId] = useState(null);
  const [reportReason, setReportReason] = useState('broken-link');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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
        // Pre-populate notes from API
        const initialNotes = {};
        (res.data.data.problems || []).forEach((p) => {
          if (p.note) initialNotes[p._id?.toString() || p.problemId?.toString()] = p.note;
        });
        setNotes(prev => ({ ...initialNotes, ...prev }));

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

  const saveNote = async (problemId, text) => {
    if (!problemId) return;
    setSavingNote(problemId.toString());
    try {
      await api.post('/progress/note', { problemId: problemId.toString(), text });
    } catch (e) {
      console.warn('Note save failed', e);
    } finally {
      setSavingNote(null);
    }
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

  const handleReplace = async (pid) => {
    if (!window.confirm("Swap this problem for a new one from the database?")) return;
    setReplacingProblem(pid);
    try {
      const res = await api.post('/schedule/replace-problem', { problemId: pid });
      if (res.data.success) {
        await fetchToday(true);
        await checkAuth();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to replace problem');
    } finally {
      setReplacingProblem(null);
    }
  };

  const submitReport = async () => {
    if (!reportModalProblemId) return;
    setIsSubmittingReport(true);
    try {
      const res = await api.post(`/problems/${reportModalProblemId}/report`, { reason: reportReason, description: reportDescription });
      if (res.data.success) {
        alert('Report submitted. Admin will review and allow replacement if needed.');
        setReportModalProblemId(null);
        setReportReason('broken-link');
        setReportDescription('');
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
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

  const { problems, progress, dayNumber, isRevision, carryoverCount, isRestDay, isPaused, pauseReason } = scheduleData;

  if (isPaused) {
    return (
      <div className="reveal visible" style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>⏸️</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px' }}>Schedule Paused</h2>
        <p style={{ color: 'var(--slate-400)', marginBottom: '32px', fontSize: '1.2rem', lineHeight: '1.6' }}>
          Your schedule has been paused by the administrator. Don't worry, your streak and progress are frozen safely until the schedule resumes.
        </p>
        {pauseReason && (
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'inline-block', marginBottom: '32px' }}>
            <strong>Reason:</strong> {pauseReason}
          </div>
        )}
      </div>
    );
  }

  if (isRestDay && carryoverCount === 0) {
    return (
      <div className="reveal visible" style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛋️</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px' }}>Sunday Rest Day</h2>
        <p style={{ color: 'var(--slate-400)', marginBottom: '20px', fontSize: '1.2rem', lineHeight: '1.6' }}>
          Take a deep breath and relax. No new patterns today.
        </p>
        <p style={{ color: 'var(--amber-500)', marginBottom: '32px', fontSize: '1rem', fontWeight: 'bold' }}>
          If you want to keep practicing, try LeetCode's Problem of the Day!
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="https://leetcode.com/" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '14px 28px' }}>View POTD</a>
          <Link to="/dashboard/calendar" className="btn btn-ghost" style={{ padding: '14px 28px' }}>Browse Roadmap</Link>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((progress.completed / progress.total) * 100) || 0;
  const accentColor = isRevision ? 'var(--emerald-500)' : 'var(--indigo-500)';

  return (
    <div className="reveal visible container" style={{ paddingBottom: '80px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span className="badge badge-primary" style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}>
            {isRestDay ? 'REST DAY CATCH-UP' : (isRevision ? 'REVISION DAY' : `MISSION DAY ${dayNumber}`)}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)', fontWeight: '600' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.04em', lineHeight: '1' }}>
          {isRestDay ? <><span className="gradient-text">Catch-up</span> Time</> : <>Today's <span className="gradient-text">Patterns</span></>}
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '500px', lineHeight: '1.5' }}>
          {isRestDay ? "It's a rest day, but let's clear out your remaining carry-over problems to stay on track." : (isRevision ? "Reviewing previously solved patterns to build long-term muscle memory." : "Mastering the sliding window and two-pointer patterns through deliberate practice.")}
        </p>

        {/* Carry-over notice banner */}
        {carryoverCount > 0 && (
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', maxWidth: '560px' }}>
            <span style={{ fontSize: '1.25rem' }}>📌</span>
            <div>
              <span style={{ fontWeight: '700', color: 'var(--amber-500)', fontSize: '0.9rem' }}>{carryoverCount} problem{carryoverCount > 1 ? 's' : ''} rolled over from previous days</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>These were not completed earlier and have been added to today's session.</p>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-grid today-grid">
        {/* Problems List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {problems.map((p, i) => {
            const pid = (p._id || p.problemId)?.toString();
            const noteText = notes[pid] ?? p.note ?? '';
            const isNoteOpen = expandedNote === pid;

            return (
            <div key={p.slug || i} className="glass-card problem-card-hover" style={{ 
              padding: '20px 24px',
              background: p.solved ? 'var(--bg-surface)' : 'var(--bg-card)',
              opacity: p.solved ? 0.8 : 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: p.isCarryover
                ? (p.solved ? '1px solid rgba(245,158,11,0.2)' : '2px solid rgba(245,158,11,0.4)')
                : (p.solved ? '1px solid var(--border-color)' : '2px solid var(--border-color-strong)'),
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Top row: checkbox + problem info + note toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div 
                  onClick={() => toggleProblem(p)}
                  style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: p.solved ? (p.isCarryover ? 'var(--amber-500)' : accentColor) : 'var(--bg-surface)',
                    color: p.solved ? 'var(--bg-base)' : 'var(--slate-600)',
                    fontSize: '1.25rem', flexShrink: 0,
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                    opacity: p.leetcodeSlug ? 0.8 : 1,
                    cursor: p.leetcodeSlug ? 'not-allowed' : 'pointer'
                  }}
                >
                  {p.solved ? '✓' : (p.leetcodeSlug ? '🔒' : '')}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{p.title || p.name}</h3>
                    <span className={`badge badge-${(p.difficulty || '').toLowerCase()}`}>{p.difficulty}</span>
                    {p.isOptional && (
                      <span style={{ 
                        fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', 
                        background: p.leetcodeSlug ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)', 
                        color: p.leetcodeSlug ? '#ef4444' : 'var(--slate-500)', 
                        border: p.leetcodeSlug ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(100,116,139,0.3)', 
                        letterSpacing: '0.04em' 
                      }}>
                         {p.leetcodeSlug ? '💎 PREMIUM / OPTIONAL' : '⚪ OPTIONAL'}
                      </span>
                    )}
                    {p.isCarryover && (
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', background: 'rgba(245,158,11,0.12)', color: 'var(--amber-500)', border: '1px solid rgba(245,158,11,0.3)', letterSpacing: '0.04em' }}>📌 CARRY-OVER</span>
                    )}
                    {p.isFoundation && (
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', background: 'rgba(16,185,129,0.1)', color: 'var(--emerald-500)', border: '1px solid rgba(16,185,129,0.3)', letterSpacing: '0.04em' }}>🏋️ FOUNDATION</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {(!p.leetcodeSlug && !p.gfgUrl) ? (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: '500' }}>
                        No proper links available. 
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(p.title || p.name)}`} target="_blank" rel="noreferrer" style={{ marginLeft: '4px', color: 'var(--indigo-400)', textDecoration: 'none', fontWeight: '600' }}>
                          Search Web ↗
                        </a>
                      </span>
                    ) : (
                      <ProblemLink
                        leetcodeSlug={p.leetcodeSlug}
                        gfgUrl={p.gfgUrl || p.gfgLink}
                        url={p.url || p.leetcodeLink}
                      />
                    )}
                    {(p.youtubeUrl || p.resourceUrl) && (
                      <a href={p.youtubeUrl || p.resourceUrl} target="_blank" rel="noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.8125rem', color: '#ef4444', fontWeight: '600',
                        textDecoration: 'none', padding: '3px 10px',
                        background: 'rgba(239,68,68,0.08)', borderRadius: '8px',
                        border: '1px solid rgba(239,68,68,0.2)', transition: 'all 0.2s'
                      }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                      >
                        ▶ Tutorial
                      </a>
                    )}
                    {(p.videoSolution || p.gfgLink) && (
                      <a href={p.videoSolution || p.gfgLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: '600', textDecoration: 'none' }}>Solution ↗</a>
                    )}
                  </div>
                </div>

                {/* Note toggle button */}
                <button
                  onClick={() => setExpandedNote(isNoteOpen ? null : pid)}
                  title={isNoteOpen ? 'Close notes' : (noteText ? 'Edit note' : 'Add note')}
                  style={{
                    flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: noteText ? 'rgba(99,102,241,0.1)' : 'var(--bg-surface)',
                    border: noteText ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border-color)',
                    color: noteText ? 'var(--indigo-400)' : 'var(--slate-500)',
                    fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = 'var(--indigo-400)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = noteText ? 'rgba(99,102,241,0.1)' : 'var(--bg-surface)'; e.currentTarget.style.borderColor = noteText ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'; e.currentTarget.style.color = noteText ? 'var(--indigo-400)' : 'var(--slate-500)'; }}
                >
                  📝
                </button>

                {(p.isOptional || p.canReplace) ? (
                  <button
                    onClick={() => handleReplace(pid)}
                    disabled={replacingProblem === pid}
                    title="Replace this reported problem"
                    style={{
                      flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                      color: 'var(--amber-500)', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                      opacity: replacingProblem === pid ? 0.5 : 1
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    🔄
                  </button>
                ) : (
                  <button
                    onClick={() => setReportModalProblemId(pid)}
                    title="Report link issue"
                    style={{
                      flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                      color: 'var(--slate-500)', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    🚩
                  </button>
                )}
              </div>

              {/* Expandable notes section */}
              {isNoteOpen && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Notes</span>
                    {savingNote === pid && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Saving...</span>
                    )}
                    {savingNote !== pid && noteText && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--emerald-500)' }}>✓ Saved</span>
                    )}
                  </div>
                  <textarea
                    value={noteText}
                    onChange={e => setNotes(prev => ({ ...prev, [pid]: e.target.value }))}
                    onBlur={() => saveNote(pid, noteText)}
                    placeholder="Write your approach, key insight, time/space complexity, or anything you want to remember..."
                    rows={4}
                    style={{
                      width: '100%', resize: 'vertical', padding: '12px 14px',
                      background: 'var(--bg-base)', color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)', borderRadius: '10px',
                      fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'inherit',
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--indigo-500)'; }}
                    onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => { saveNote(pid, noteText); setExpandedNote(null); }}
                      style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', background: accentColor, color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Save & Close
                    </button>
                    <button
                      onClick={() => setExpandedNote(null)}
                      style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', background: 'var(--bg-surface)', color: 'var(--slate-400)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
            );
          })}
          
          {/* Search & Practice */}
          {scheduleData?.searchPractice && scheduleData.searchPractice.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🔍</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--slate-300)' }}>Search & Practice</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '16px', lineHeight: '1.5' }}>
                These conceptual questions have no direct links to LeetCode or GeeksForGeeks. Search for them online to practice the theory — they don't count towards your daily goal streak.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scheduleData.searchPractice.map((p, i) => (
                  <div key={p.slug || i} style={{ 
                    padding: '16px', 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{p.topic} • {p.difficulty}</div>
                    </div>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(p.name + ' ' + p.topic + ' ' + (p.source || 'dsa problem'))}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-sm btn-ghost"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      Search Web ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        .today-grid { grid-template-columns: 1fr; gap: 32px; }
        @media (min-width: 1024px) {
          .today-grid { grid-template-columns: 1.6fr 1fr; }
        }
        .problem-card-hover:hover { transform: translateY(-2px); border-color: var(--border-color-strong) !important; }
      `}</style>

      {/* Report Modal */}
      {reportModalProblemId && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color-strong)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚩 Report Problem
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--slate-400)', marginBottom: '8px' }}>Reason</label>
              <select 
                value={reportReason} onChange={e => setReportReason(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
              >
                <option value="broken-link">Broken / Missing Link</option>
                <option value="wrong-difficulty">Wrong Difficulty</option>
                <option value="wrong-topic">Wrong Topic</option>
                <option value="missing-details">Missing Details</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--slate-400)', marginBottom: '8px' }}>Description (optional)</label>
              <textarea 
                value={reportDescription} onChange={e => setReportDescription(e.target.value)}
                rows={3}
                placeholder="Give us details..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setReportModalProblemId(null)}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={submitReport}
                disabled={isSubmittingReport}
                style={{ padding: '8px 16px' }}
              >
                {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}
    </div>
  );
};

export default TodayView;
