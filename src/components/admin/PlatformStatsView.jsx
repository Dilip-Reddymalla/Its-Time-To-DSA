import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PlatformStatsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/stats');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch platform stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Crunching numbers...</p>
      </div>
    );
  }

  if (!data) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px' }}>Failed to load stats.</p>;

  const chartFontColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8';

  // Solved per day line chart
  const solvedLineData = {
    labels: data.solvedPerDay.map(d => {
      const parts = d.date.split('-');
      return `${parts[1]}/${parts[2]}`;
    }),
    datasets: [
      {
        label: 'Problems Solved',
        data: data.solvedPerDay.map(d => d.solved),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Active Users',
        data: data.solvedPerDay.map(d => d.activeUsers),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: chartFontColor, font: { family: 'Inter', size: 11 }, padding: 16 }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { color: chartFontColor, font: { family: 'Inter', size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: chartFontColor, font: { family: 'Inter', size: 10 }, maxRotation: 45 },
      },
    },
  };

  // Difficulty distribution bar
  const diffBarData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [{
      label: 'Total Solved',
      data: [data.difficultyDistribution.Easy || 0, data.difficultyDistribution.Medium || 0, data.difficultyDistribution.Hard || 0],
      backgroundColor: ['rgba(16, 185, 129, 0.5)', 'rgba(245, 158, 11, 0.5)', 'rgba(239, 68, 68, 0.5)'],
      borderColor: ['rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)', 'rgba(239, 68, 68, 1)'],
      borderWidth: 1,
      borderRadius: 8,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: chartFontColor, font: { family: 'Inter' } } },
      x: { grid: { display: false }, ticks: { color: chartFontColor, font: { family: 'Inter', weight: '600' } } },
    },
  };

  return (
    <div className="reveal visible container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
          Platform <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          {data.totalProblems} problems in database · {data.totalUniqueSolved} unique problems solved
        </p>
      </div>

      {/* KPI row */}
      <div className="admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '28px' }}>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Problem Bank</div>
          <div className="admin-kpi-value" style={{ color: 'var(--indigo-500)', fontSize: '1.5rem' }}>{data.totalProblems}</div>
          <div className="admin-kpi-sub">total problems</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Unique Solved</div>
          <div className="admin-kpi-value" style={{ color: 'var(--emerald-500)', fontSize: '1.5rem' }}>{data.totalUniqueSolved}</div>
          <div className="admin-kpi-sub">across all users</div>
        </div>
        {data.goalDistribution.map((g) => (
          <div key={g._id} className="admin-kpi-card">
            <div className="admin-kpi-label" style={{ textTransform: 'capitalize' }}>{g._id || 'Unset'} Goal</div>
            <div className="admin-kpi-value" style={{ color: 'var(--amber-500)', fontSize: '1.5rem' }}>{g.count}</div>
            <div className="admin-kpi-sub">users</div>
          </div>
        ))}
      </div>

      <div className="admin-detail-grid">
        {/* Solved Per Day Chart */}
        <div className="admin-section-card admin-detail-full">
          <div className="admin-section-title">📈 Problems Solved & Active Users (30 Days)</div>
          <div style={{ height: '320px', position: 'relative' }}>
            <Line data={solvedLineData} options={lineOptions} />
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="admin-section-card">
          <div className="admin-section-title">📊 Difficulty Distribution</div>
          <div style={{ height: '260px', position: 'relative' }}>
            <Bar data={diffBarData} options={barOptions} />
          </div>
        </div>

        {/* Top Topics */}
        <div className="admin-section-card">
          <div className="admin-section-title">🔥 Most Popular Topics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
            {data.topTopics.length > 0 ? (
              data.topTopics.map((t, i) => {
                const maxCount = data.topTopics[0].count || 1;
                return (
                  <div key={t.topic}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {i < 3 && <span style={{ marginRight: '6px' }}>{['🥇', '🥈', '🥉'][i]}</span>}
                        {t.topic}
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--indigo-400)' }}>{t.count}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-card)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(t.count / maxCount) * 100}%`,
                        background: 'linear-gradient(90deg, var(--indigo-500), var(--indigo-400))',
                        borderRadius: '99px', transition: 'width 0.8s ease-out',
                      }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No topic data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformStatsView;
