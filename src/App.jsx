/**
 * Web Application Entry
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import DashboardLayout from './components/dashboard/DashboardLayout';
import TodayView from './components/dashboard/TodayView';
import ProgressView from './components/dashboard/ProgressView';
import CalendarView from './components/dashboard/CalendarView';
import ProfileView from './components/dashboard/ProfileView';

const App = () => {
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
          <Route path="profile" element={<ProfileView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
