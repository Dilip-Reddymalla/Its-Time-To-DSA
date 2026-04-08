import React from 'react';

// Utility to get IST date string in YYYY-MM-DD
const getISTDateStr = (date) => 
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);

const ActivityHeatmap = ({ heatmapData = {} }) => {
  const now = new Date();
  const todayISTStr = getISTDateStr(now);

  // Generate last 183 days (approx 6 months)
  const days = [];
  for (let i = 182; i >= 0; i--) {
    // We want the YYYY-MM-DD for "Today IST minus i days"
    const d = new Date(now.getTime());
    d.setDate(d.getDate() - i);
    
    const istStr = getISTDateStr(d);
    
    // To get day of week and month for the IST date, we parse it back as local midnight
    const istDateObj = new Date(istStr + 'T00:00:00');

    days.push({
      date: istStr,
      count: heatmapData[istStr] || 0,
      dayOfWeek: istDateObj.getDay(),
      month: istDateObj.getMonth(),
      isToday: istStr === todayISTStr,
      isRestDay: heatmapData[istStr] === -1,
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

  const getBackground = (day) => {
    if (!day) return 'transparent';
    if (day.isRestDay) return 'repeating-linear-gradient(45deg, transparent, transparent 2px, var(--border-color-strong) 2px, var(--border-color-strong) 4px)';
    if (day.count === 0) return 'var(--bg-card)';
    if (day.count === 1) return 'color-mix(in srgb, var(--text-primary) 20%, transparent)';
    if (day.count === 2) return 'color-mix(in srgb, var(--text-primary) 40%, transparent)';
    if (day.count === 3) return 'color-mix(in srgb, var(--text-primary) 70%, transparent)';
    return 'var(--text-primary)';
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="glass-card" style={{ padding: '24px', overflowX: 'auto', borderRadius: 'var(--radius)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Activity Record
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>183 days of deliberate practice.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getBackground({isRestDay: true}) }}></div>
            <span>REST</span>
          </div>
          <div style={{ width: '1px', height: '12px', background: 'var(--border-color-strong)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>LESS</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2, 3, 4].map(v => (
                <div key={v} style={{ width: '12px', height: '12px', borderRadius: '2px', background: getBackground({count: v}), border: v === 0 ? '1px solid var(--border-color)' : 'none' }}></div>
              ))}
            </div>
            <span>MORE</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', minWidth: 'max-content', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        {/* Day Labels Row-Synced */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '16px' }}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => {
            const label = i === 1 ? 'Mon' : i === 3 ? 'Wed' : i === 5 ? 'Fri' : '';
            return (
              <div key={i} style={{ height: '12px', fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: '12px', display: 'flex', alignItems: 'center' }}>
                {label}
              </div>
            );
          })}
          {/* Spacer to match bottom month label height */}
          <div style={{ height: '28px' }}></div> 
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {groupedByMonth.map((mGroup, mIdx) => (
             <div key={mIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Weeks inside this month */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {mGroup.weeks.map((week, wIdx) => (
                  <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {week.map((day, dIdx) => {
                      if (!day) return <div key={dIdx} style={{ width: '12px', height: '12px' }}></div>;
                      
                      // Identify Boss Fights: Saturdays (index 6) with actual activity
                      const isBossFight = day.dayOfWeek === 6 && day.count > 0;
                      
                      return (
                        <div
                          key={dIdx}
                          title={`${day.date}: ${day.count} solved`}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            background: getBackground(day),
                            border: day.count === 0 ? '1px solid var(--border-color)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.2s',
                            outline: day.isToday ? '2px solid var(--accent-primary)' : 'none',
                            outlineOffset: '2px',
                          }}
                          onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                          onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                          {isBossFight && (
                            <span style={{ fontSize: '8px', color: 'var(--bg-base)', lineHeight: 1 }}>★</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Month Label */}
              <div style={{ marginTop: '12px', fontSize: '0.65rem', color: 'var(--text-primary)', fontWeight: '700', height: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
