import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import DonorDashboard from './pages/DonorDashboard';
import AddDonation from './pages/AddDonation';
import AdminPanel from './pages/AdminPanel';
import LiveFeed from './pages/LiveFeed';
import VolunteerTasks from './pages/VolunteerTasks';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import LiveMapPage from './pages/LiveMapPage';

const LandingRoute = () => {
  const { currentUser } = useAuth();
  if (currentUser) {
    switch (currentUser.role) {
      case 'admin': return <Navigate to="/admin" replace />;
      case 'donor': return <Navigate to="/dashboard" replace />;
      case 'ngo': return <Navigate to="/feed" replace />;
      case 'volunteer': return <Navigate to="/tasks" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }
  return <LandingPage />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/live-map" element={<LiveMapPage />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-donation"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <AddDonation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/feed"
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <LiveFeed />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <VolunteerTasks />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
