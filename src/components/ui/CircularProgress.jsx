import React from 'react';

const CircularProgress = ({ value, size = 120, strokeWidth = 10, color = 'var(--emerald-500)' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        <circle
          stroke="var(--border-color)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ 
            transition: 'stroke-dashoffset 0.5s ease', 
            transform: 'rotate(-90deg)', 
            transformOrigin: '50% 50%' 
          }}
        />
      </svg>
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '1.5rem', 
        fontWeight: '900', 
        color: 'var(--text-primary)',
        pointerEvents: 'none'
      }}>
        {Math.round(value)}%
      </div>
    </div>
  );
};

export default CircularProgress;
