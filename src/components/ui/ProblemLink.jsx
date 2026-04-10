import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

/**
 * ProblemLink — validates LeetCode slugs server-side (CORS bypass) and
 * automatically falls back to GFG if the problem page is 404 / unavailable.
 *
 * Props:
 *  - leetcodeSlug : string | null
 *  - gfgUrl       : string | null  (also accepted as gfgLink)
 *  - url          : string | null  (generic override URL)
 *  - style        : object         (extra link styles)
 */

// Module-level cache — persists across renders/navigations within the same session.
const _cache = {};

const ProblemLink = ({ leetcodeSlug, gfgUrl: gfgProp, gfgLink, url, style = {} }) => {
  const gfgUrl = gfgProp || gfgLink || null;
  const lcUrl = leetcodeSlug ? `https://leetcode.com/problems/${leetcodeSlug}` : null;

  const initState = () => {
    if (!leetcodeSlug) return 'generic';
    if (_cache[leetcodeSlug] !== undefined)
      return _cache[leetcodeSlug] ? 'lc-valid' : 'lc-invalid';
    return 'loading';
  };

  const [linkState, setLinkState] = useState(initState);
  const [resolvedGfg, setResolvedGfg] = useState(gfgUrl);
  const alive = useRef(true);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    if (!leetcodeSlug) { setLinkState('generic'); return; }
    if (_cache[leetcodeSlug] !== undefined) {
      setLinkState(_cache[leetcodeSlug] ? 'lc-valid' : 'lc-invalid');
      return;
    }

    let cancelled = false;
    setLinkState('loading');

    api.get(`/problems/validate-lc/${encodeURIComponent(leetcodeSlug)}`)
      .then(({ data }) => {
        if (cancelled || !alive.current) return;
        _cache[leetcodeSlug] = data.valid;
        if (data.gfgUrl) setResolvedGfg(data.gfgUrl);
        setLinkState(data.valid ? 'lc-valid' : 'lc-invalid');
      })
      .catch(() => {
        if (cancelled || !alive.current) return;
        _cache[leetcodeSlug] = true; // optimistic on network error
        setLinkState('lc-valid');
      });

    return () => { cancelled = true; };
  }, [leetcodeSlug]);

  const base = {
    fontSize: '0.8125rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'opacity 0.2s',
    ...style,
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (linkState === 'loading') {
    return (
      <span style={{ ...base, color: 'var(--slate-600)', cursor: 'default', opacity: 0.5 }}>
        Checking link…
      </span>
    );
  }

  // ── LeetCode valid ───────────────────────────────────────────────────────────
  if (linkState === 'lc-valid' && lcUrl) {
    return (
      <a href={lcUrl} target="_blank" rel="noreferrer" style={{ ...base, color: 'var(--indigo-400)' }}>
        Solve on LeetCode ↗
      </a>
    );
  }

  // ── LeetCode 404 / invalid ───────────────────────────────────────────────────
  if (linkState === 'lc-invalid') {
    if (resolvedGfg) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <a href={resolvedGfg} target="_blank" rel="noreferrer" style={{ ...base, color: 'var(--emerald-400)' }}>
            Solve on GFG ↗
          </a>
          <span style={{
            fontSize: '0.62rem', padding: '1px 6px', borderRadius: '99px',
            background: 'rgba(245,158,11,0.1)', color: 'var(--amber-500)',
            border: '1px solid rgba(245,158,11,0.25)', whiteSpace: 'nowrap',
          }}>
            LC unavailable
          </span>
        </span>
      );
    }
    // No GFG either — best-effort LC link
    return (
      <a href={lcUrl} target="_blank" rel="noreferrer" style={{ ...base, color: 'var(--slate-500)' }}>
        LeetCode ↗
        <span style={{
          fontSize: '0.62rem', padding: '1px 6px', borderRadius: '99px',
          background: 'rgba(245,158,11,0.1)', color: 'var(--amber-500)',
          border: '1px solid rgba(245,158,11,0.25)',
        }}>
          may be down
        </span>
      </a>
    );
  }

  // ── Generic / no-LC ──────────────────────────────────────────────────────────
  const fallbackUrl = url || resolvedGfg || '#';
  return (
    <a href={fallbackUrl} target="_blank" rel="noreferrer"
      style={{ ...base, color: resolvedGfg ? 'var(--emerald-400)' : 'var(--indigo-400)' }}>
      {resolvedGfg ? 'Solve on GFG ↗' : 'Solve on Platform ↗'}
    </a>
  );
};

export default ProblemLink;
