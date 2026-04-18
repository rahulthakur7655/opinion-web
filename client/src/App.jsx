import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import WalletPage from './pages/WalletPage';
import BrandsPage from './pages/BrandsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Navbar from './components/Layout/Navbar';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F5C842, #FFB700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#1a1000',
          margin: '0 auto 1rem',
          animation: 'pulse 1.5s infinite',
        }}>O</div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading Opinifi...</div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 64px)' }}>
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/feed" /> : <AuthPage />} />
      <Route path="/feed" element={
        <ProtectedRoute>
          <AppLayout><FeedPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/wallet" element={
        <ProtectedRoute>
          <AppLayout>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <WalletPage />
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/brands" element={
        <ProtectedRoute>
          <AppLayout>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <BrandsPage />
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <AppLayout>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <LeaderboardPage />
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to={user ? "/feed" : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color: '#F0EEF8',
              border: '1px solid #2A2A45',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
