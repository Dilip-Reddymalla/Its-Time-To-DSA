import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const { getGoogleAuthUrl, isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If arriving back here after Google auth, verify cookie and populate store
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-page">
      <div className="bg-grid"></div>
      <div className="bg-glow-orb" style={{ top: '20%', left: '20%' }}></div>
      <div className="bg-glow-orb" style={{ bottom: '20%', right: '20%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0) 70%)' }}></div>

      <div className="auth-card reveal visible">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <img src="/logo.png" alt="Its Time to DSA" style={{ width: '64px', height: '64px', borderRadius: '16px', boxShadow: 'var(--shadow-glow)' }} />
        </div>
        
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '8px' }}>
          Welcome to It's Time To DSA
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.9375rem', marginBottom: '32px' }}>
          Sign in to start your personalized 90-day DSA journey.
        </p>

        <a href={getGoogleAuthUrl()} className="google-btn">
          <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Continue with Google
        </a>

        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '32px' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
