import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from '../../hooks/useHotkeys';

const routes = [
  { id: 'today', name: 'Today\'s Mission', path: '/dashboard/today', icon: '⚡' },
  { id: 'roadmap', name: 'Browse Roadmap', path: '/dashboard/calendar', icon: '📅' },
  { id: 'progress', name: 'Performance Stats', path: '/dashboard/progress', icon: '📊' },
  { id: 'all-problems', name: 'Problem DB', path: '/dashboard/problems', icon: '📚' },
  { id: 'profile', name: 'Account Settings', path: '/dashboard/profile', icon: '⚙️' },
];

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Toggle Palette on Cmd+K / Ctrl+K
  useHotkeys('k', true, () => {
    setIsOpen(prev => !prev);
  });
  
  useHotkeys('Escape', false, () => {
    setIsOpen(false);
  });

  const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredRoutes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredRoutes[activeIndex];
      if (target) {
        navigate(target.path);
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '15vh'
    }} onClick={() => setIsOpen(false)}>
      
      <div className="glass-card" onClick={e => e.stopPropagation()} style={{
        width: '90%', maxWidth: '600px', background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', marginRight: '12px', color: 'var(--slate-400)' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands or jump to..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%', border: 'none', background: 'transparent', color: 'var(--text-primary)',
              fontSize: '1.1rem', outline: 'none'
            }}
          />
        </div>

        <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {filteredRoutes.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--slate-500)' }}>
              No commands found.
            </div>
          ) : (
            filteredRoutes.map((route, i) => (
              <div
                key={route.id}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  navigate(route.path);
                  setIsOpen(false);
                }}
                style={{
                  padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: activeIndex === i ? 'var(--bg-surface)' : 'transparent',
                  border: activeIndex === i ? '1px solid var(--border-color)' : '1px solid transparent',
                  color: activeIndex === i ? 'var(--text-primary)' : 'var(--slate-400)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{route.icon}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: activeIndex === i ? '600' : '400' }}>{route.name}</span>
                {activeIndex === i && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--slate-500)', background: 'var(--bg-base)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>Enter ↵</span>}
              </div>
            ))
          )}
        </div>
        
        <div style={{ padding: '8px 16px', display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--slate-500)', borderTop: '1px solid var(--border-color)', background: 'var(--bg-base)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><kbd style={{ background: 'var(--bg-card)', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>↑↓</kbd> to navigate</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><kbd style={{ background: 'var(--bg-card)', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>esc</kbd> to close</span>
        </div>
      </div>
      
    </div>
  );
};

export default CommandPalette;
