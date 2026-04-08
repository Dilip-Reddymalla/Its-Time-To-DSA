import React from 'react';

// Build a stable UTC-based YYYY-MM-DD key (matches backend storage format)
const toUTCDateStr = (d) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

// Build today's LOCAL date string (for highlighting the correct "today" cell visually)
const toLocalDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const ActivityHeatmap = ({ heatmapData = {} }) => {
  const nowLocal = new Date();
  // "Today" in local terms — for visual highlight only
  const todayLocalStr = toLocalDateStr(nowLocal);

  // Generate last 365 days. Use UTC midnight to match how backend stores Progress.date
  const days = [];
  for (let i = 364; i >= 0; i--) {
    // Step back i days from today in UTC
    const utcMs = Date.UTC(nowLocal.getUTCFullYear(), nowLocal.getUTCMonth(), nowLocal.getUTCDate() - i);
    const d = new Date(utcMs);
    const utcStr = toUTCDateStr(d);        // key for looking up heatmapData
    const localStr = toLocalDateStr(d);     // for checking if this is "today" locally
    days.push({
      date: utcStr,
      count: heatmapData[utcStr] || 0,
      dayOfWeek: d.getUTCDay(),             // UTC day-of-week keeps grid columns aligned
      month: d.getUTCMonth(),
      isToday: localStr === todayLocalStr,
    });
  }

  // Group by weeks
  const weeks = [];
  let currentWeek = [];

  // Padding: use the first day entry's already-correct local dayOfWeek
  const firstDayOfWeek = days[0].dayOfWeek;
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const getColor = (count) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    if (count === 1) return 'rgba(16, 185, 129, 0.2)';
    if (count === 2) return 'rgba(16, 185, 129, 0.4)';
    if (count === 3) return 'rgba(16, 185, 129, 0.7)';
    return 'rgba(16, 185, 129, 1)';
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="glass-card" style={{ padding: 'min(24px, 4vw)', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Activity Heatmap
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: 'bold' }}>
          <span>LESS</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2, 3, 4].map(v => (
              <div key={v} style={{ width: '12px', height: '12px', borderRadius: '3px', background: getColor(v), border: '1px solid rgba(255,255,255,0.02)' }}></div>
            ))}
          </div>
          <span>MORE</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content' }}>
        {/* Day Labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '8px', paddingTop: '14px' }}>
          {['Mon', 'Wed', 'Fri'].map(day => (
            <span key={day} style={{ fontSize: '0.65rem', color: 'var(--slate-600)', height: '10px', lineHeight: '10px', marginBottom: '14px' }}>{day}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  title={day ? `${day.date}: ${day.count} solved` : ''}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: day ? getColor(day.count) : 'transparent',
                    cursor: day ? 'pointer' : 'default',
                    transition: 'transform 0.1s',
                    outline: day?.isToday ? '2px solid rgba(99,102,241,0.8)' : 'none',
                    outlineOffset: '1px',
                  }}
                  onMouseOver={e => day && (e.currentTarget.style.transform = 'scale(1.3)')}
                  onMouseOut={e => day && (e.currentTarget.style.transform = 'scale(1)')}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
