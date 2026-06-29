import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AnalyzerPage from './pages/AnalyzerPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import HistoryPage from './pages/HistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import RepositoryPage from './pages/RepositoryPage';
import SettingsPage from './pages/SettingsPage';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layout wrapper for authenticated pages (with sidebar)
function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Layout for public pages (without sidebar)
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking account authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

// Guest-only route (redirect to dashboard if logged in)
function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying session status..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected routes with sidebar layout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
        <Route path="/analyzer/:id" element={<AnalysisResultPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/repositories" element={<RepositoryPage />} />
        <Route path="/repositories/:id" element={<RepositoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
