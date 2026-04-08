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

  // Generate last 183 days (approx 6 months) to fit desktop without scroll.
  const days = [];
  for (let i = 182; i >= 0; i--) {
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

  // Group strictly by months, and then by weeks within those months
  const groupedByMonth = [];
  let currentMonthGroup = null;

  days.forEach(day => {
    if (!currentMonthGroup || currentMonthGroup.month !== day.month) {
      if (currentMonthGroup) {
         while(currentMonthGroup.currentWeek.length < 7) {
            currentMonthGroup.currentWeek.push(null);
         }
         currentMonthGroup.weeks.push(currentMonthGroup.currentWeek);
         groupedByMonth.push(currentMonthGroup);
      }
      currentMonthGroup = {
        month: day.month,
        weeks: [],
        currentWeek: []
      };
      // Pad the start of this month's first week
      for (let i = 0; i < day.dayOfWeek; i++) {
        currentMonthGroup.currentWeek.push(null);
      }
    }

    currentMonthGroup.currentWeek.push(day);

    if (currentMonthGroup.currentWeek.length === 7) {
      currentMonthGroup.weeks.push(currentMonthGroup.currentWeek);
      currentMonthGroup.currentWeek = [];
    }
  });

  if (currentMonthGroup) {
    if (currentMonthGroup.currentWeek.length > 0) {
      while(currentMonthGroup.currentWeek.length < 7) {
         currentMonthGroup.currentWeek.push(null);
      }
      currentMonthGroup.weeks.push(currentMonthGroup.currentWeek);
    }
    groupedByMonth.push(currentMonthGroup);
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

      <div style={{ display: 'flex', minWidth: 'max-content' }}>
        {/* Day Labels Row-Synced */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '10px' }}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => {
            const label = i === 1 ? 'Mon' : i === 3 ? 'Wed' : i === 5 ? 'Fri' : '';
            return (
              <div key={i} style={{ height: '10px', fontSize: '0.65rem', color: 'var(--slate-600)', lineHeight: '10px', display: 'flex', alignItems: 'center' }}>
                {label}
              </div>
            );
          })}
          {/* Spacer to match bottom month label height */}
          <div style={{ height: '24px' }}></div> 
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {groupedByMonth.map((mGroup, mIdx) => (
            <div key={mIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Weeks inside this month */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {mGroup.weeks.map((week, wIdx) => (
                  <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {week.map((day, dIdx) => (
                      day ? (
                        <div
                          key={dIdx}
                          title={`${day.date}: ${day.count} solved`}
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            background: getColor(day.count),
                            cursor: 'pointer',
                            transition: 'transform 0.1s',
                            outline: day.isToday ? '2px solid rgba(99,102,241,0.8)' : 'none',
                            outlineOffset: '1px',
                          }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.3)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        ></div>
                      ) : (
                        <div key={dIdx} style={{ width: '10px', height: '10px' }}></div>
                      )
                    ))}
                  </div>
                ))}
              </div>

              {/* Month Label */}
              <div style={{ marginTop: '8px', fontSize: '0.65rem', color: 'var(--slate-500)', fontWeight: '700', height: '16px' }}>
                {monthNames[mGroup.month]}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default ActivityHeatmap;
