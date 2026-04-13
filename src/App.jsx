/**
 * Web Application Entry
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import DashboardLayout from './components/dashboard/DashboardLayout';
import TodayView from './components/dashboard/TodayView';
import ProgressView from './components/dashboard/ProgressView';
import CalendarView from './components/dashboard/CalendarView';
import ProfileView from './components/dashboard/ProfileView';
import ProblemSetView from './components/dashboard/ProblemSetView';
import JournalView from './components/dashboard/JournalView';
import AdminLayout from './pages/AdminLayout';
import AdminOverview from './components/admin/AdminOverview';
import UserListView from './components/admin/UserListView';
import UserDetailView from './components/admin/UserDetailView';
import TodaySnapshotView from './components/admin/TodaySnapshotView';
import LeaderboardView from './components/admin/LeaderboardView';
import PlatformStatsView from './components/admin/PlatformStatsView';

const App = () => {
  React.useEffect(() => {
    // Check for token in hash fragment (delivered by backend for Cross-Origin/iOS support)
    const hash = window.location.hash;
    if (hash && hash.includes('token=')) {
      const tokenMatch = hash.match(/token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        localStorage.setItem('token', token);
        
        // Scrub the hash from URL instantly
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      {/* Todo: global ToastContainer, Theme wrapper, Auth listener */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        
        {/* Dashboard Routes nested under Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="today" replace />} />
          <Route path="today" element={<TodayView />} />
          <Route path="progress" element={<ProgressView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="problems" element={<ProblemSetView />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="journal" element={<JournalView />} />

        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<UserListView />} />
          <Route path="users/:userId" element={<UserDetailView />} />
          <Route path="today" element={<TodaySnapshotView />} />
          <Route path="leaderboard" element={<LeaderboardView />} />
          <Route path="stats" element={<PlatformStatsView />} />
        </Route>
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
};

export default App;
