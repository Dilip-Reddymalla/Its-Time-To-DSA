import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import ProblemLink from '../ui/ProblemLink';

/* ─── Tiny helpers ────────────────────────────────────────────────────────── */
const diffColor = (d) => {
  if (d === 'Easy')   return { bg: 'rgba(16,185,129,0.1)',  color: 'var(--emerald-400)' };
  if (d === 'Hard')   return { bg: 'rgba(239,68,68,0.1)',   color: '#f87171' };
  return                     { bg: 'rgba(99,102,241,0.1)',  color: 'var(--indigo-400)' };
};

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

/* ─── Per-problem Note Editor ─────────────────────────────────────────────── */
const NoteEditor = ({ problem, date, onSave }) => {
  const [text, setText] = useState(problem.note || '');
  const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [open, setOpen] = useState(false);

  const save = useCallback(async (value = text) => {
    setStatus('saving');
    try {
      await api.post('/progress/note', {
        problemId: problem.problemId.toString(),
        text: value,
        date,
      });
      setStatus('saved');
      onSave?.(problem.problemId.toString(), value);
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [text, problem.problemId, date, onSave]);

  const dc = diffColor(problem.difficulty);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Problem row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 18px', cursor: 'pointer',
        }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Solved checkmark */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(16,185,129,0.15)', color: 'var(--emerald-400)',
          fontSize: '0.9rem', fontWeight: '900',
        }}>
          ✓
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {problem.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', background: dc.bg, color: dc.color, border: `1px solid ${dc.color}40` }}>
              {problem.difficulty}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: '500' }}>{problem.topic}</span>
            {(!problem.leetcodeSlug && !problem.gfgUrl) ? (
              <a href={`https://www.google.com/search?q=${encodeURIComponent(problem.name)}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--indigo-400)', textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }}>
                🔎 Search Web
              </a>
            ) : (
              <ProblemLink
                leetcodeSlug={problem.leetcodeSlug}
                gfgUrl={problem.gfgUrl}
                style={{ fontSize: '0.75rem' }}
              />
            )}
            {problem.youtubeUrl && (
              <a href={problem.youtubeUrl} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.75rem', color: '#ef4444', fontWeight: '600',
                textDecoration: 'none', padding: '2px 8px',
                background: 'rgba(239,68,68,0.08)', borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.2)', transition: 'all 0.2s'
              }}
                onClick={(e) => e.stopPropagation()}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              >
                ▶ Tutorial
              </a>
            )}
          </div>
        </div>

        {/* Note indicator + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {text && (
            <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '99px', background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-400)', border: '1px solid rgba(99,102,241,0.25)', fontWeight: '600' }}>
              📝 note
            </span>
          )}
          <span style={{
            color: 'var(--slate-500)', fontSize: '0.9rem',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}>▾</span>
        </div>
      </div>

      {/* Expandable note editor */}
      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Notes</span>
            {status === 'saving' && <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Saving…</span>}
            {status === 'saved'  && <span style={{ fontSize: '0.7rem', color: 'var(--emerald-500)' }}>✓ Saved</span>}
            {status === 'error'  && <span style={{ fontSize: '0.7rem', color: '#f87171' }}>⚠ Save failed</span>}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={() => save()}
            placeholder="Add your approach, time/space complexity, key insights, links to resources…"
            rows={4}
            style={{
              width: '100%', resize: 'vertical', padding: '12px 14px',
              background: 'var(--bg-base)', color: 'var(--text-primary)',
              border: '1px solid var(--border-color)', borderRadius: '10px',
              fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'inherit',
              outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--indigo-500)'; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => save()}
              disabled={status === 'saving'}
              style={{
                padding: '7px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700',
                background: 'var(--indigo-500)', color: 'white', border: 'none',
                cursor: status === 'saving' ? 'not-allowed' : 'pointer', opacity: status === 'saving' ? 0.6 : 1,
              }}
            >
              {status === 'saving' ? 'Saving…' : 'Save Note'}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
                background: 'var(--bg-surface)', color: 'var(--slate-400)',
                border: '1px solid var(--border-color)', cursor: 'pointer',
              }}
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Day Card ────────────────────────────────────────────────────────────── */
const DayCard = ({ entry }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [notes, setNotes] = useState(() => {
    const m = {};
    entry.problems.forEach(p => { m[p.problemId.toString()] = p.note || ''; });
    return m;
  });

  const handleSave = (pid, text) => {
    setNotes(prev => ({ ...prev, [pid]: text }));
  };

  const typeLabel = entry.type === 'revision' ? '🔄 Revision' : '📚 Learn';
  const typeColor = entry.type === 'revision' ? 'var(--emerald-400)' : 'var(--indigo-400)';
  const dayLabel  = entry.dayNumber ? `Day ${String(entry.dayNumber).padStart(2, '0')}` : '—';

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '20px 24px', cursor: 'pointer',
          background: 'var(--bg-card)',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-color)',
        }}
        onClick={() => setCollapsed(c => !c)}
      >
        {/* Day number pill */}
        <div style={{
          minWidth: '64px', padding: '6px 12px', borderRadius: '10px', textAlign: 'center',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--indigo-400)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            {dayLabel}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '2px' }}>
            <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{fmt(entry.date)}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: typeColor, background: `${typeColor}18`, padding: '2px 8px', borderRadius: '99px', border: `1px solid ${typeColor}35` }}>
              {typeLabel}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: '500' }}>
            {entry.solvedCount} problem{entry.solvedCount !== 1 ? 's' : ''} solved
            {' · '}
            {entry.problems.filter(p => notes[p.problemId.toString()]).length} note{entry.problems.filter(p => notes[p.problemId.toString()]).length !== 1 ? 's' : ''} written
          </div>
        </div>

        <span style={{
          color: 'var(--slate-500)', fontSize: '1.1rem',
          transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.25s',
          display: 'inline-block',
        }}>▾</span>
      </div>

      {/* Problem list */}
      {!collapsed && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {entry.problems.map((p, i) => (
            <NoteEditor
              key={p.problemId?.toString() || i}
              problem={{ ...p, note: notes[p.problemId.toString()] }}
              date={entry.date}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Journal View ───────────────────────────────────────────────────── */
const JournalView = () => {
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('All');

  useEffect(() => {
    const fetchJournal = async () => {
      setLoading(true);
      try {
        const res = await api.get('/progress/journal');
        if (res.data.success) {
          // Sort day 01 first
          const sorted = [...res.data.data].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
          setJournal(sorted);
        }
      } catch {
        setError('Failed to load your journal. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchJournal();
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredJournal = journal
    .map(entry => ({
      ...entry,
      problems: entry.problems.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase());
        const matchDiff   = filterDiff === 'All' || p.difficulty === filterDiff;
        return matchSearch && matchDiff;
      }),
    }))
    .filter(entry => entry.problems.length > 0);

  const totalSolved = journal.reduce((s, e) => s + e.solvedCount, 0);
  const totalNotes  = journal.reduce((s, e) => s + e.problems.filter(p => p.note).length, 0);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader" />
        <p style={{ marginTop: '24px', color: 'var(--slate-400)' }}>Loading your journal…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Failed to load</h2>
        <p style={{ color: 'var(--slate-400)' }}>{error}</p>
      </div>
    );
  }

  if (journal.length === 0) {
    return (
      <div className="reveal visible" style={{ textAlign: 'center', padding: '100px 40px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📓</div>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px' }}>Journal Empty</h2>
        <p style={{ color: 'var(--slate-400)', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto' }}>
          Start solving problems in your Today view and your journal will fill up day by day.
        </p>
      </div>
    );
  }

  return (
    <div className="reveal visible container" style={{ paddingBottom: '80px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: '1', marginBottom: '10px' }}>
          My <span className="gradient-text">Journal</span>
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)', marginBottom: '28px' }}>
          All your solved problems, day by day — with your personal notes.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {[
            { label: 'Days Active',    value: journal.length,                   icon: '📅' },
            { label: 'Problems Solved', value: totalSolved,                      icon: '✅' },
            { label: 'Notes Written',  value: totalNotes,                        icon: '📝' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: '160px' }}>
              <span style={{ fontSize: '1.5rem' }}>{icon}</span>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: '600', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '400px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)', fontSize: '0.9rem', pointerEvents: 'none' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search problems or topics…"
              style={{
                width: '100%', padding: '10px 14px 10px 38px',
                background: 'var(--bg-card)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)', borderRadius: '12px',
                fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {['All', 'Easy', 'Medium', 'Hard'].map(d => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              style={{
                padding: '9px 18px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700',
                cursor: 'pointer', border: '1px solid',
                transition: 'all 0.2s',
                ...(filterDiff === d
                  ? { background: 'var(--indigo-500)', color: 'white', borderColor: 'var(--indigo-500)' }
                  : { background: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }
                ),
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Day cards ───────────────────────────────────────────────────── */}
      {filteredJournal.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--slate-500)' }}>
          No problems match your filter. Try clearing the search or difficulty filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredJournal.map((entry, i) => (
            <DayCard key={entry.dateKey || i} entry={entry} />
          ))}
        </div>
      )}

      <style>{`
      `}</style>
    </div>
  );
};

export default JournalView;
