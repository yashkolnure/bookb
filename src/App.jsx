import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StorePage from './pages/StorePage';
import BookingPage from './pages/BookingPage';
import AppointmentManagePage from './pages/AppointmentManagePage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ServicesPage from './pages/dashboard/ServicesPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import StoreSettingsPage from './pages/dashboard/StoreSettingsPage';
import CouponsPage from './pages/dashboard/CouponsPage';
import ReviewsPage from './pages/dashboard/ReviewsPage';
import PlansPage from './pages/dashboard/PlansPage';
import CalendarPage from './pages/dashboard/CalendarPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/store/:slug" element={<StorePage />} />
      <Route path="/book/:serviceId" element={<BookingPage />} />
      <Route path="/appointments/:id/manage" element={<AppointmentManagePage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="settings" element={<StoreSettingsPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="calendar" element={<CalendarPage />} />
      </Route>
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '14px',
              borderRadius: '8px',
              background: '#fffdf9',
              color: '#1a1410',
              border: '1px solid #e2d9d0',
              boxShadow: '0 4px 16px rgba(26,20,16,0.10)',
            },
            success: { iconTheme: { primary: '#3a7d5e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#c4432a', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
