import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import ActivityHeatmap from './ActivityHeatmap';

const ProgressView = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '24px', color: 'var(--slate-400)' }}>Calculating your mastery...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ color: 'var(--slate-400)', padding: '40px', textAlign: 'center' }}>
        <h2>No statistics available yet.</h2>
        <p>Complete your first daily challenge to see your progress!</p>
      </div>
    );
  }

  // Bar Chart Data
  const chartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Problems Solved',
        data: [
          stats.difficultyDistribution.Easy || 0,
          stats.difficultyDistribution.Medium || 0,
          stats.difficultyDistribution.Hard || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.4)', // Emerald
          'rgba(245, 158, 11, 0.4)', // Amber
          'rgba(239, 68, 68, 0.4)',  // Red
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'var(--text-primary)', drawBorder: false },
        ticks: { color: '#64748b', stepSize: 1, font: { family: 'Inter' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter', weight: '600' } }
      }
    }
  };

  return (
    <div className="reveal visible container" style={{ paddingBottom: '80px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>Mastery Analytics</h1>
        <p style={{ color: 'var(--slate-400)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>Tracking your consistency and pattern recognition.</p>
      </div>

      {/* Primary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(160px, 30vw, 220px), 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)', textAlign: 'center' }}>
          <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Consistency</div>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '900', color: 'var(--amber-500)', marginBottom: '4px' }}>{stats.currentStreak} <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--slate-600)' }}>Days</span></div>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Current Streak</p>
        </div>
        <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)', textAlign: 'center' }}>
          <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Total Impact</div>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '900', color: 'var(--indigo-500)', marginBottom: '4px' }}>{stats.totalSolved}</div>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Problems Conquered</p>
        </div>
        <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)', textAlign: 'center' }}>
          <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Persistence</div>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '900', color: 'var(--emerald-500)', marginBottom: '4px' }}>{stats.daysActive}</div>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Sessions Logged</p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div style={{ marginBottom: '32px', maxWidth: '100%', overflowX: 'auto', paddingBottom: '10px' }} className="custom-scrollbar">
        <ActivityHeatmap heatmapData={stats.heatmap} />
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 45vw, 400px), 1fr))', gap: '32px' }}>
        
        {/* Difficulty Distribution */}
        <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
          <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '24px', fontSize: '1.125rem' }}>Difficulty Distribution</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.125rem' }}>Topic Breakdown</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--indigo-400)', fontWeight: 'bold' }} className="hide-mobile">TOP PERFORMER</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
            {Object.entries(stats.topicBreakdown).length > 0 ? (
              Object.entries(stats.topicBreakdown)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([topic, data]) => (
                <div key={topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{topic}</span>
                    <span style={{ color: 'var(--slate-400)', fontWeight: '500' }}>{data.total} solved</span>
                  </div>
                  <div style={{ width: '100%', background: 'var(--bg-surface)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ 
                      background: `linear-gradient(90deg, var(--indigo-500), var(--indigo-400))`, 
                      height: '100%', 
                      width: `${Math.min(100, (data.total / 20) * 100)}%`, 
                      boxShadow: '0 0 15px rgba(99,102,241,0.3)',
                      transition: 'width 1s ease-out'
                    }}></div>
                  </div>
                </div>
              ))
            ) : (
                <div style={{ color: 'var(--slate-500)', textAlign: 'center', marginTop: '60px', opacity: 0.5 }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🌱</div>
                  No topic data yet. Start your first mission to build your profile!
                </div>
            )}
          </div>
        </div>

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--slate-600); border-radius: 4px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ProgressView;
