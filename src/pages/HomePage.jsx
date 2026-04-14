import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import StatsTicker from '../components/home/StatsTicker';
import FeaturesGrid from '../components/home/FeaturesGrid';
import Footer from '../components/home/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Send all users to the main dashboard by default.
      // Admins can navigate to the admin panel from the dashboard sidebar.
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="bg-grid"></div>
      <div className="bg-glow-orb" style={{ top: '10%', left: '20%' }}></div>
      <div className="bg-glow-orb" style={{ bottom: '10%', right: '10%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }}></div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        <main>
          <HeroSection />
          <StatsTicker />
          <FeaturesGrid />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
