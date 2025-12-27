import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import WorkspaceLayout from './components/WorkspaceLayout';
import { useAuthStore } from './store/useAuthStore';
import { useChatStore } from './store/useChatStore';
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';
import CalendarPage from './pages/CalendarPage';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [authUser, subscribeToMessages, unsubscribeFromMessages]);

  if (isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Loader className="size-10 animate-spin text-gray-400" />
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />

        {/* Protected Workspace Layout */}
        <Route path="/" element={authUser ? <WorkspaceLayout /> : <Navigate to="/login" />}>
          {/* Default Redirect to Workspace - Logic handled in Layout useEffect, but we need a placeholder index */}
          <Route index element={<div className="flex-1 bg-black flex items-center justify-center text-gray-500">Loading Workspace...</div>} />

          <Route path="workspace/:orgId/chat" element={<HomePage />} />
          {/* Calendar Route Placeholder */}
          <Route path="workspace/:orgId/calendar" element={<CalendarPage />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/onboarding" element={authUser ? <OnboardingPage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster
        toastOptions={{
          className: '!bg-[#111] !border !border-[#333] !text-white font-sans !rounded-xl !shadow-xl',
          style: {
            background: '#111',
            border: '0px solid #000000ff',
            color: '#ffffffff',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#006015ff',
              secondary: '#111',
            },
          },
          error: {
            iconTheme: {
              primary: '#830202ff',
              secondary: '#111',
            },
          },
          loading: {
            style: {
              background: '#171717ff',
              color: '#fff',
            }
          }
        }}
      />
    </GoogleOAuthProvider>
  );
};

export default App;