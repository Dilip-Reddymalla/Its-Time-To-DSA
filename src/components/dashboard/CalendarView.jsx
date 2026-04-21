import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import ProblemLink from '../ui/ProblemLink';

const CalendarView = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchFullSchedule = async () => {
      setLoading(true);
      try {
        const res = await api.get('/schedule/full');
        if (res.data.success) {
          setSchedule(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch full schedule", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullSchedule();
  // location.key changes on navigation, user changes on reschedule/profile update.
  }, [location.key, user]);

  if (loading) {
    return (
      <div style={{ color: 'var(--text-primary)', padding: '40px', textAlign: 'center' }}>
        <div className="loader" style={{ margin: '0 auto 24px' }}></div>
        <h2 style={{ opacity: 0.5 }}>Loading {user?.name?.split(' ')[0]}'s Vision...</h2>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="reveal visible" style={{ color: 'var(--slate-400)', padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🗓️</div>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', marginBottom: '16px' }}>Your Roadmap Awaits</h2>
        <p style={{ maxWidth: '500px', margin: '0 auto 32px', fontSize: '1.1rem' }}>Complete the onboarding process to generate your personalized 90-day DSA journey.</p>
        <Link to="/onboarding" className="btn btn-primary btn-lg">Start Onboarding</Link>
      </div>
    );
  }

  // Group by month
  const months = {};
  schedule.forEach((day) => {
    const d = new Date(day.date);
    const mKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!months[mKey]) {
      months[mKey] = {
        name: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        days: []
      };
    }
    months[mKey].days.push(day);
  });

  const renderGrid = (monthData) => {
    const daysInMonth = monthData.days;

    // Use raw ISO string prefix (YYYY-MM-DD) natively supplied by the DB
    const dateMap = {};
    daysInMonth.forEach((day) => {
      const key = day.date.split('T')[0];
      dateMap[key] = day;
    });

    const [firstYear, firstMonth] = daysInMonth[0].date.split('T')[0].split('-');

    // Use UTC date math to get absolute monthly properties immune to local timezone drifts
    const startPadding = new Date(Date.UTC(firstYear, parseInt(firstMonth) - 1, 1)).getUTCDay(); // 0=Sun
    const daysInCalMonth = new Date(Date.UTC(firstYear, parseInt(firstMonth), 0)).getUTCDate();

    // Determine 'today' in IST (consistent with backend effective date logic)
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: '700', color: 'var(--slate-600)', padding: '6px 0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{d}</div>
        ))}

        {/* Leading empty cells */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} style={{ aspectRatio: '1/1' }} />
        ))}

        {/* All calendar days in this month */}
        {Array.from({ length: daysInCalMonth }).map((_, i) => {
          const dNum = i + 1;
          const calDateStr = `${firstYear}-${String(firstMonth).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
          const scheduledDay = dateMap[calDateStr];
          const isToday = calDateStr === todayStr;
          const isRevision = scheduledDay && (scheduledDay.type === 'revision' || scheduledDay.type === 'mixed');
          const isLearn = scheduledDay && scheduledDay.type === 'learn';
          const isScheduled = !!scheduledDay;
          const isPastDay = isScheduled && calDateStr < todayStr;

          // Progress-based states (from backend's enrichedDays)
          const isDone = isScheduled && scheduledDay.allDone;
          const isIncomplete = isPastDay && !isDone && (scheduledDay.problemCount || 0) > 0;
          const hasCarryoverAlert = isScheduled && scheduledDay.hasPrevIncomplete && !isToday;

          // ── Colour coding (priority: today > done > incomplete > carry-over-alert > revision > learn) ──
          let bg = 'var(--bg-base)';
          let border = '1px solid var(--border-color)';
          let dayNumColor = 'var(--slate-600)';

          if (isToday) {
            bg = 'rgba(99,102,241,0.15)';
            border = '2px solid var(--indigo-500)';
            dayNumColor = 'var(--text-primary)';
          } else if (isIncomplete) {
            // Past day — problems were not all done
            bg = 'rgba(239,68,68,0.07)';
            border = '1px solid rgba(239,68,68,0.3)';
            dayNumColor = '#f87171';
          } else if (isDone) {
            // Completed day — Sky Blue
            bg = 'rgba(56,189,248,0.09)';
            border = '1px solid rgba(56,189,248,0.3)';
            dayNumColor = '#38bdf8';
          } else if (hasCarryoverAlert && !isRevision) {
            // The day right after an incomplete day — amber accent
            bg = 'rgba(245,158,11,0.07)';
            border = '1px solid rgba(245,158,11,0.3)';
            dayNumColor = 'var(--amber-500)';
          } else if (isRevision) {
            bg = 'rgba(192,132,252,0.05)';
            border = '1px solid rgba(192,132,252,0.15)';
            dayNumColor = '#c084fc';
          } else if (isLearn) {
            bg = 'rgba(99,102,241,0.05)';
            border = '1px solid rgba(99,102,241,0.12)';
            dayNumColor = 'var(--slate-300)';
          }

          return (
            <div
              key={calDateStr}
              onClick={() => scheduledDay && setSelectedDay(scheduledDay)}
              style={{
                aspectRatio: '1/1',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isScheduled ? 'pointer' : 'default',
                border,
                background: bg,
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseOver={(e) => {
                if (!isScheduled) return;
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.zIndex = '2';
                if (!isToday) e.currentTarget.style.borderColor = 'var(--indigo-400)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = '1';
                if (!isToday) {
                  if (isIncomplete) e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                  else if (isDone) e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)';
                  else if (hasCarryoverAlert) e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                  else if (isRevision) e.currentTarget.style.borderColor = 'rgba(192,132,252,0.15)';
                  else if (isLearn) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)';
                  else e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              {/* Date number */}
              <span style={{
                fontSize: '0.9rem',
                fontWeight: isToday ? '900' : isScheduled ? '700' : '400',
                color: dayNumColor,
                lineHeight: 1,
              }}>
                {i + 1}
              </span>

              {/* D-badge */}
              {isScheduled && (
                <span style={{
                  marginTop: '3px',
                  fontSize: '0.55rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  padding: '1px 4px',
                  borderRadius: '99px',
                  background: isIncomplete
                    ? 'rgba(239,68,68,0.2)'
                    : isDone
                    ? 'rgba(56,189,248,0.25)'
                    : isToday
                    ? 'rgba(99,102,241,0.4)'
                    : isRevision
                    ? 'rgba(192,132,252,0.2)'
                    : 'rgba(99,102,241,0.15)',
                  color: isIncomplete
                    ? '#f87171'
                    : isDone
                    ? '#38bdf8'
                    : isRevision
                    ? '#c084fc'
                    : 'var(--indigo-300)',
                  textTransform: 'uppercase',
                }}>
                  D{scheduledDay.dayNumber}
                </span>
              )}

              {/* Status dot (top-right corner) */}
              {isScheduled && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: isIncomplete
                    ? '#ef4444'
                    : isDone
                    ? '#0ea5e9'
                    : hasCarryoverAlert
                    ? 'var(--amber-500)'
                    : isRevision
                    ? '#a855f7'
                    : 'transparent',
                  boxShadow: isIncomplete
                    ? '0 0 5px rgba(239,68,68,0.7)'
                    : isDone
                    ? '0 0 5px rgba(14,165,233,0.7)'
                    : hasCarryoverAlert
                    ? '0 0 5px rgba(245,158,11,0.7)'
                    : isRevision
                    ? '0 0 5px rgba(168,85,247,0.7)'
                    : 'none',
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="reveal visible container" style={{ paddingBottom: '80px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
      <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
            {user?.name?.split(' ')[0]}'s Master Roadmap
          </h1>
          <p style={{ color: 'var(--slate-400)', fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)', marginBottom: '20px' }}>Visualize your 90-day evolution from patterns to mastery.</p>

          {/* Color Legend */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { dot: 'var(--indigo-500)', label: 'Today' },
              { dot: '#0ea5e9', label: 'Completed' },
              { dot: '#ef4444',            label: 'Incomplete (past)' },
              { dot: 'var(--amber-500)',   label: 'Has carry-overs' },
              { dot: '#a855f7', label: 'Revision' },
              { dot: 'var(--indigo-300)',  label: 'Upcoming' },
            ].map(({ dot, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, boxShadow: `0 0 5px ${dot}80`, flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 45vw, 360px), 1fr))', gap: '64px 48px' }}>
        {Object.entries(months).map(([key, month]) => (
          <div key={key} className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '28px', color: 'var(--text-primary)', borderLeft: '5px solid var(--indigo-500)', paddingLeft: '20px', letterSpacing: '-0.01em' }}>{month.name}</h3>

            <div style={{ width: '100%', overflowX: 'auto' }} className="custom-scrollbar">
              <div style={{ minWidth: '280px' }}>
                {renderGrid(month)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-in Details Panel — rendered via portal into #modal-root in index.html */}
      {selectedDay && ReactDOM.createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <div
            onClick={() => setSelectedDay(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)', cursor: 'pointer' }}
          />
          {/* Panel */}
          <div
            className="glass"
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '100%',
              padding: 'clamp(24px, 6vw, 48px)',
              position: 'relative',
              overflowY: 'auto',
              borderLeft: '1px solid var(--border-color)',
              animation: 'slideRight 0.38s cubic-bezier(0, 0.55, 0.45, 1)',
              background: 'var(--bg-card)',
              zIndex: 1,
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedDay(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                color: 'var(--slate-400)', fontSize: '1.25rem', cursor: 'pointer',
                transition: 'all 0.2s', zIndex: 10,
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--slate-400)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ marginBottom: '32px', paddingRight: '40px' }}>
              <div style={{ color: 'var(--indigo-400)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8125rem', marginBottom: '8px', letterSpacing: '0.1em' }}>
                {selectedDay.type === 'revision' ? '🔄 Revision Day' : `📅 Day ${selectedDay.dayNumber}`}
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                {selectedDay.concepts?.[0] || selectedDay.readings?.[0]?.title || 'Learning Session'}
              </h2>
              <p style={{ color: 'var(--slate-400)', marginTop: '12px', fontSize: '0.9375rem' }}>
                {new Date(selectedDay.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '36px' }}>
              <div className="glass-card" style={{ flex: 1, padding: '16px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--indigo-400)' }}>{selectedDay.problems?.length || (selectedDay.problemIds?.length || 0)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Tasks</div>
              </div>
              <div className="glass-card" style={{ flex: 1, padding: '16px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: selectedDay.allDone ? '#0ea5e9' : 'var(--text-primary)' }}>
                  {selectedDay.allDone ? '✓' : (selectedDay.completedCount || 0)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Solved</div>
              </div>
              <div className="glass-card" style={{ flex: 1, padding: '16px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>{selectedDay.estimatedTime || '—'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Commitment</div>
              </div>
            </div>

            {/* Problem list */}
            <h3 style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Target Problems</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedDay.problems && selectedDay.problems.map((sp, i) => {
                const p = sp.problemId;
                if (!p || !p.name) return null;
                return (
                  <div
                    key={i}
                    className="glass-card"
                    style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', fontSize: '0.9375rem' }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${(sp.difficulty || p.difficulty || 'easy').toLowerCase()}`}>{sp.difficulty || p.difficulty || 'Easy'}</span>
                      {sp.isRevision && <span className="badge" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>🔄 Revision</span>}
                      {sp.isCarryover && <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--amber-500)', border: '1px solid rgba(245,158,11,0.2)' }}>📌 Carry-over</span>}
                      <ProblemLink
                        leetcodeSlug={p.leetcodeSlug}
                        gfgUrl={p.gfgUrl}
                        style={{ marginLeft: '4px' }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!selectedDay.problems || selectedDay.problems.length === 0) && (
                <div style={{ textAlign: 'center', color: 'var(--slate-500)', padding: '32px', fontSize: '0.9rem' }}>No problems assigned for this day.</div>
              )}
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      <style>{`
        @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default CalendarView;
