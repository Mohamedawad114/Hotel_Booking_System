import { Routes, Route, Navigate } from 'react-router-dom';

import SignupPage from '@/features/auth/pages/SignupPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import TwoFAPage from '@/features/auth/pages/TwoFAPage';
import ConfirmEmailPage from '@/features/auth/pages/ConfirmEmailPage';
import ForgotPasswordPage from '@/features/profile/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/profile/pages/ResetPasswordPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import HotelSearchPage from '@/features/hotel/pages/HotelSearchPage';
import HotelDetailsPage from '@/features/hotel/pages/HotelDetailsPage';
import FavoritesPage from '@/features/favorites/pages/FavoritesPage';
import BookHotelPage from '@/features/booking/pages/BookHotelPage';
import BookingsListPage from '@/features/booking/pages/BookingsListPage';
import BookingDetailsPage from '@/features/booking/pages/BookingDetailsPage';
import PaymentPage from '@/features/payment/pages/PaymentPage';
import PaymentsListPage from '@/features/payment/pages/PaymentsListPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import DashboardPage from '@/pages/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth (public) */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/2fa" element={<TwoFAPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<HotelSearchPage />} />
        <Route path="/hotel/:id" element={<HotelDetailsPage />} />
        <Route path="/hotel/:id/book" element={<BookHotelPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/bookings" element={<BookingsListPage />} />
        <Route path="/bookings/:id" element={<BookingDetailsPage />} />
        <Route path="/bookings/:id/pay" element={<PaymentPage />} />
        <Route path="/payments" element={<PaymentsListPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
