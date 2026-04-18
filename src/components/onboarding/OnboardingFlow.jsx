import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [dailyGoal, setDailyGoal] = useState('medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalDays, setTotalDays] = useState(90);
  const [sundayRestEnabled, setSundayRestEnabled] = useState(true);
  const [preferences, setPreferences] = useState({
    targetCompanies: [],
    weakTopics: []
  });

  const GOALS = [
    { id: 'light', label: 'Light', desc: '3 problems', icon: '🌱' },
    { id: 'medium', label: 'Medium', desc: '5 problems', icon: '🚀' },
    { id: 'intense', label: 'Intense', desc: '8 problems', icon: '🔥' },
  ];

  const DURATIONS = [
    { value: 60, label: 'Sprint', desc: '60 Days', icon: '⚡' },
    { value: 90, label: 'Standard', desc: '90 Days', icon: '📅' },
    { value: 120, label: 'Marathon', desc: '120 Days', icon: '🐢' }
  ];

  const COMPANIES = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Uber', 'Other'];
  const TOPICS = ['Arrays', 'Strings', 'Dynamic Programming', 'Graphs', 'Trees', 'Heaps', 'Backtracking'];

  const handleVerifyLeetCode = async () => {
    if (!leetcodeUsername.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/onboarding/validate-lc/${encodeURIComponent(leetcodeUsername.trim())}`);
      if (res.data.success === true && res.data.valid === true) {
        setStep(3);
      } else if (res.data.success === false || res.data.valid === false) {
        setError(res.data.message || 'Username not found on LeetCode.');
      } else {
        // Fallback for network issues (like LeetCode being slow but we don't want to hard-block)
        // If the user wants to strictly block 404s, they will now be blocked by the previous statement.
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify LeetCode username.');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (category, item) => {
    setPreferences(prev => {
      const list = prev[category];
      if (list.includes(item)) {
        return { ...prev, [category]: list.filter(i => i !== item) };
      }
      return { ...prev, [category]: [...list, item] };
    });
  };

  const handleGenerateSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/onboarding/complete', {
        leetcodeUsername: leetcodeUsername.trim(),
        startDate: new Date(startDate).toISOString(),
        dailyGoal,
        totalDays,
        sundayRestEnabled,
        preferences // Sending extra info for future parity
      });
      await checkAuth();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate schedule.');
      setLoading(false);
    }
  };

  const [checkLoading, setCheckLoading] = useState(true);

  useEffect(() => {
    const checkScheduleStatus = async () => {
      try {
        const res = await api.get('/schedule/today');
        if (res.data.success) {
          // A schedule exists and today has an entry — redirect!
          navigate('/dashboard');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // NO_SCHEDULE or NO_DAY_ENTRY means it's okay to stay here
          setCheckLoading(false);
        } else {
          // Other error — maybe auth?
          navigate('/login');
        }
      } finally {
        setCheckLoading(false);
      }
    };

    checkScheduleStatus();
  }, [navigate]);

  if (checkLoading) {
    return (
      <div className="auth-page">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ padding: '24px', overflowY: 'auto' }}>
      <div className="bg-grid"></div>
      <div className="bg-glow-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.5 }}></div>

      <div style={{ width: '100%', maxWidth: '650px', position: 'relative', zIndex: 10, margin: '40px auto' }}>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: '6px', flex: 1, borderRadius: '99px', transition: 'all 0.5s ease',
              background: step >= i ? 'var(--indigo-500)' : 'var(--bg-surface)',
              boxShadow: step >= i ? 'var(--shadow-glow)' : 'none'
            }}></div>
          ))}
        </div>

        <div className="bento-card reveal visible" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', padding: '40px' }}>
          
          {error && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.875rem', fontWeight: '500', textAlign: 'center', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99,102,241,0.2)', color: 'var(--indigo-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 24px' }}>👋</div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '16px' }}>Ready to crush DSA, {user?.name.split(' ')[0]}?</h1>
              <p style={{ color: 'var(--slate-400)', fontSize: '1.125rem', marginBottom: '32px' }}>We'll build you a 90-day roadmap tailored to your speed and target companies.</p>
              <button onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Get Started</button>
            </div>
          )}

          {/* STEP 2: LeetCode */}
          {step === 2 && (
            <div style={{ margin: 'auto 0' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Sync LeetCode</h2>
              <p style={{ color: 'var(--slate-400)', marginBottom: '32px' }}>Enter your username so we can track your daily progress.</p>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-300)', marginBottom: '12px' }}>Username</label>
                <input
                  type="text"
                  placeholder="e.g. neetcode"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px', color: 'var(--text-primary)', outline: 'none', fontSize: '1.125rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setStep(1)} className="btn btn-ghost">Back</button>
                <button onClick={handleVerifyLeetCode} disabled={loading || !leetcodeUsername} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? 'Verifying...' : 'Next Step'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Intensity & Date */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Your Training Plan</h2>
              <p style={{ color: 'var(--slate-400)', marginBottom: '32px' }}>Choose your grind level and starting date.</p>
              
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-300)', marginBottom: '12px' }}>Daily Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setDailyGoal(g.id)}
                      style={{
                        padding: '16px 8px', borderRadius: '12px', border: dailyGoal === g.id ? '2px solid var(--indigo-500)' : '1px solid var(--border-color)',
                        background: dailyGoal === g.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                        color: dailyGoal === g.id ? 'var(--text-primary)' : 'var(--slate-400)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{g.icon}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{g.label}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-300)', marginBottom: '12px' }}>Roadmap Duration</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {DURATIONS.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setTotalDays(d.value)}
                      style={{
                        padding: '16px 8px', borderRadius: '12px', border: totalDays === d.value ? '2px solid var(--emerald-500)' : '1px solid var(--border-color)',
                        background: totalDays === d.value ? 'rgba(16,185,129,0.1)' : 'transparent',
                        color: totalDays === d.value ? 'var(--text-primary)' : 'var(--slate-400)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{d.icon}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{d.label}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-300)', marginBottom: '12px' }}>Journey Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px', color: 'var(--text-primary)', marginBottom: '16px' }}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <input 
                    type="checkbox" 
                    checked={sundayRestEnabled}
                    onChange={(e) => setSundayRestEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.925rem' }}>Enable Sunday Rest Days</span>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px', lineHeight: '1.4' }}>Take Sundays off to recharge. No new patterns will be assigned.</p>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setStep(2)} className="btn btn-ghost">Back</button>
                <button onClick={() => setStep(4)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Continue</button>
              </div>
            </div>
          )}

          {/* STEP 4: Finalize */}
          {step === 4 && (
            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>One last thing...</h2>
              <p style={{ color: 'var(--slate-400)', marginBottom: '32px' }}>Optionally customize your target companies or areas of focus.</p>
              
              <div style={{ textAlign: 'left', marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--slate-500)', marginBottom: '12px', textTransform: 'uppercase' }}>Target Companies</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {COMPANIES.map(c => (
                    <button key={c} onClick={() => togglePreference('targetCompanies', c)}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8125rem', border: preferences.targetCompanies.includes(c) ? '1px solid var(--indigo-500)' : '1px solid var(--border-color)', background: preferences.targetCompanies.includes(c) ? 'var(--indigo-500)' : 'transparent', color: preferences.targetCompanies.includes(c) ? 'var(--bg-base)' : 'var(--text-primary)', cursor: 'pointer' }}>{c}</button>
                  ))}
                </div>

                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--slate-500)', marginBottom: '12px', textTransform: 'uppercase' }}>Focus Areas</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TOPICS.map(t => (
                    <button key={t} onClick={() => togglePreference('weakTopics', t)}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8125rem', border: preferences.weakTopics.includes(t) ? '1px solid var(--emerald-500)' : '1px solid var(--border-color)', background: preferences.weakTopics.includes(t) ? 'var(--emerald-500)' : 'transparent', color: preferences.weakTopics.includes(t) ? 'var(--bg-base)' : 'var(--text-primary)', cursor: 'pointer' }}>{t}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setStep(3)} className="btn btn-ghost">Back</button>
                <button onClick={handleGenerateSchedule} disabled={loading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? 'Building Roadmap...' : 'Construct My Roadmap'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
