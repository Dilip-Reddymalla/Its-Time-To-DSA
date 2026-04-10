import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const ProfileView = () => {
  const { checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Editable fields
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dailyGoal, setDailyGoal] = useState('medium');
  const [totalDays, setTotalDays] = useState(90);
  const [reschedule, setReschedule] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/profile');
      if (res.data.success) {
        const data = res.data.data;
        setProfile(data);
        setLeetcodeUsername(data.leetcodeUsername || '');
        setDailyGoal(data.dailyGoal || 'medium');
        setTotalDays(data.totalDays || 90);
        if (data.startDate) {
          setStartDate(new Date(data.startDate).toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/user/update', {
        leetcodeUsername,
        dailyGoal,
        startDate,
        totalDays,
        reschedule
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setProfile(res.data.data);
        if (reschedule) {
          setReschedule(false);
          // Refresh the global user object (picks up new startDate/totalDays)
          // then navigate to Today — this forces TodayView & CalendarView to re-mount
          // and re-fetch the updated schedule from the server.
          await checkAuth();
          navigate('/dashboard/today');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
      <div className="loader"></div>
    </div>
  );

  const changesLeft = 2 - (profile?.usernameChangeCount || 0);

  return (
    <div className="reveal visible container" style={{ paddingBottom: '80px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>User Settings</h1>
        <p style={{ color: 'var(--slate-400)', fontSize: 'clamp(0.9375rem, 2vw, 1.1rem)' }}>Manage your profile and 90-day roadmap configuration.</p>
      </div>

      <div className="profile-grid dashboard-grid stack-on-mobile">
        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '1' }}>
          <div className="glass-card" style={{ padding: 'clamp(24px, 5vw, 32px)', textAlign: 'center' }}>
            <img 
              src={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} 
              alt="Avatar" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '16px', border: '3px solid var(--indigo-500)', margin: '0 auto 16px' }} 
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>{profile?.name}</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginBottom: '24px' }}>{profile?.email}</p>
            
            <div style={{ textAlign: 'left', padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LeetCode Handle</div>
              <div style={{ color: 'var(--indigo-400)', fontWeight: 'bold' }}>@{profile?.leetcodeUsername || 'not set'}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--indigo-300)' }}>Pro Tip 💡</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)', lineHeight: '1.6' }}>
              Rescheduling will recalculate your daily missions starting from your chosen date, but it will <strong>automatically skip</strong> all problems you've already solved.
            </p>
          </div>
        </div>

        {/* Update Form */}
        <div className="glass-card" style={{ padding: 'clamp(24px, 6vw, 40px)', flex: '2' }}>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-300)', marginBottom: '8px' }}>
                LeetCode Username
              </label>
              <input 
                type="text" 
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                disabled={changesLeft <= 0}
                placeholder="e.g. janesmith_99"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '4px' }}
              />
              <p style={{ fontSize: '0.75rem', color: changesLeft > 0 ? 'var(--slate-500)' : '#ef4444' }}>
                {changesLeft > 0 ? `${changesLeft} changes remaining` : 'You have reached the maximum number of username changes.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-300)', marginBottom: '8px' }}>
                  Roadmap Start Date
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-300)', marginBottom: '8px' }}>
                  Daily Intensity
                </label>
                <select 
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer' }}
                >
                  <option value="light">Light (3 problems/day)</option>
                  <option value="medium">Medium (5 problems/day)</option>
                  <option value="intense">Intense (8 problems/day)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-300)', marginBottom: '8px' }}>
                  Roadmap Duration
                </label>
                <select 
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer' }}
                >
                  <option value={60}>Sprint (60 Days)</option>
                  <option value={90}>Standard (90 Days)</option>
                  <option value={120}>Marathon (120 Days)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={reschedule}
                  onChange={(e) => setReschedule(e.target.checked)}
                  style={{ width: '20px', height: '20px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
                />
                <div>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.925rem' }}>Reschedule Plan</span>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px', lineHeight: '1.4' }}>Recalculate roadmap from chosen start date (skipping solved problems).</p>
                </div>
              </label>
            </div>

            {message && <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid var(--emerald-500)', borderRadius: '10px', color: 'var(--emerald-400)', fontSize: '0.875rem' }}>{message}</div>}
            {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '10px', color: '#f87171', fontSize: '0.875rem' }}>{error}</div>}

            <button 
              type="submit" 
              disabled={saving}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', marginTop: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {saving ? 'Processing...' : 'Save Changes'}
              {!saving && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>}
            </button>

          </form>
        </div>
      </div>

      <style>{`
        .profile-grid { grid-template-columns: minmax(0, 1fr); gap: 32px; }
        @media (min-width: 1024px) {
          .profile-grid { grid-template-columns: 1fr 2fr; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        select option {
          background-color: var(--bg-card, #0f172a);
          color: var(--text-primary)
        }
        select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 0.65em auto;
          padding-right: 2.5rem !important;
        }
      `}</style>
    </div>
  );
};

export default ProfileView;
