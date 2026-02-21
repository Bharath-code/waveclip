import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Spinner } from './components/ui';

// Lazy loaded routes for bundle optimization
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Editor = React.lazy(() => import('./pages/Editor'));
const Export = React.lazy(() => import('./pages/Export'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Settings = React.lazy(() => import('./pages/Settings'));

// Global loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Spinner size="lg" className="text-indigo-600" />
  </div>
);

import { ProtectedRoute, PublicOnlyRoute } from './features/auth/AuthProvider';

function App() {
  return (
    <ErrorBoundary>
      <Analytics />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Auth routes */}
            <Route path="/auth/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/auth/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/auth/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/editor/:projectId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
            <Route path="/export/:projectId" element={<ProtectedRoute><Export /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

