import React from 'react';

const LOGOS = [
  { name: 'LeetCode', icon: '💻' },
  { name: 'Google', icon: '🔍' },
  { name: 'Meta', icon: '♾️' },
  { name: 'Amazon', icon: '📦' },
  { name: 'Microsoft', icon: '🪟' },
  { name: 'Apple', icon: '🍎' },
  { name: 'Netflix', icon: '🍿' },
  { name: 'Uber', icon: '🚗' },
];

const StatsTicker = () => {
  return (
    <div className="ticker-wrapper">
      <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '24px' }}>
        Patterns practiced by engineers at top companies
      </p>
      
      <div className="ticker-track">
        {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((company, idx) => (
          <div key={idx} className="ticker-item">
            <span>{company.icon}</span>
            <span>{company.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsTicker;
