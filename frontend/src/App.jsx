import React from 'react'
import { useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { useChatStore } from './store/useChatStore.js';
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [authUser, subscribeToMessages, unsubscribeFromMessages]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Loader className="size-10 animate-spin text-gray-400" />
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex h-screen bg-gray-900 overflow-hidden font-sans">

        {/* Sidebar - Global & Full Height */}
        {authUser && (
          <div className={`h-full shrink-0 border-r border-gray-700 transition-all duration-300 ease-in-out
            ${selectedUser ? "hidden md:flex" : "flex"} 
          `}>
            <Sidebar />
          </div>
        )}

        <main className="flex-1 flex flex-col h-full w-full relative min-w-0">
          <div className="flex-1 flex overflow-hidden relative">
            <Routes>
              <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
              <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
              <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
              <Route path="/onboarding" element={authUser ? <OnboardingPage /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </main>

        <Toaster
          toastOptions={{
            className: '!bg-[#111] !border !border-[#333] !text-white font-sans !rounded-xl !shadow-xl',
            style: {
              background: '#111', // Card background Match
              border: '1px solid #333', // Input/Card border Match
              color: '#fff',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e', // green-500
                secondary: '#111', // Match background
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // red-500
                secondary: '#111', // Match background
              },
            },
            loading: {
              style: {
                background: '#111',
                color: '#fff',
              }
            }
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;