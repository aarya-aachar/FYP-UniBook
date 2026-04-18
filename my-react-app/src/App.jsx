import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminThemeProvider } from './context/AdminThemeContext';
import { UserThemeProvider } from './context/UserThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import Services from './pages/Services';
import ServiceProviders from './pages/ServiceProviders';
import ServiceDetails from './pages/ServiceDetails';
import Booking from './pages/Booking';

import UserDashboard from './pages/UserDashboard';
import ViewAppointments from './pages/ViewAppointments';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageProviders from './pages/ManageProviders';
import ManageBookings from './pages/ManageBookings';
import Reports from './pages/Reports';
import AdminNotifications from './pages/AdminNotifications';

import Payment from "./pages/Payment";
import UserReports from "./pages/UserReports";
import AdminProfile from "./pages/AdminProfile";
import UserNotifications from "./pages/UserNotifications";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccess from "./pages/PaymentSuccess";
import ChatWithAdmin from "./pages/ChatWithAdmin";
import AdminChats from "./pages/AdminChats";
import ProviderRegister from './pages/ProviderRegister';
import ProviderChat from './pages/ProviderChat';
import ProviderWaiting from './pages/ProviderWaiting';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderBookings from './pages/ProviderBookings';
import ProviderAvailability from './pages/ProviderAvailability';
import ProviderProfile from './pages/ProviderProfile';
import ProviderNotifications from './pages/ProviderNotifications';
import ProviderServiceSettings from './pages/ProviderServiceSettings';

function App() {
  return (
    <Router>
      <AdminThemeProvider>
        <UserThemeProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<ProtectedRoute requiredRole="user"><Profile /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/services/:serviceName" element={<ProtectedRoute><ServiceProviders /></ProtectedRoute>} />
            <Route path="/service/:providerId" element={<ProtectedRoute><ServiceDetails /></ProtectedRoute>} />
            <Route path="/booking/:providerId" element={<ProtectedRoute requiredRole="user"><Booking /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin/users" element={<ProtectedRoute requiredRole="admin"><ManageUsers /></ProtectedRoute>} />
            <Route path="/dashboard/admin/providers" element={<ProtectedRoute requiredRole="admin"><ManageProviders /></ProtectedRoute>} />
            <Route path="/dashboard/admin/bookings" element={<ProtectedRoute requiredRole="admin"><ManageBookings /></ProtectedRoute>} />
            <Route path="/dashboard/admin/reports" element={<ProtectedRoute requiredRole="admin"><Reports /></ProtectedRoute>} />
            <Route path="/dashboard/admin/notifications" element={<ProtectedRoute requiredRole="admin"><AdminNotifications /></ProtectedRoute>} />
            <Route path="/dashboard/admin/chats/users" element={<ProtectedRoute requiredRole="admin"><AdminChats roleFilter="user" /></ProtectedRoute>} />
            <Route path="/dashboard/admin/chats/providers" element={<ProtectedRoute requiredRole="admin"><AdminChats roleFilter="provider" /></ProtectedRoute>} />
            <Route path="/dashboard/admin/profile" element={<ProtectedRoute requiredRole="admin"><AdminProfile /></ProtectedRoute>} />

            
            <Route path="/notifications" element={<ProtectedRoute requiredRole="user"><UserNotifications /></ProtectedRoute>} />
            <Route path="/payment/:providerId" element={<ProtectedRoute requiredRole="user"><Payment /></ProtectedRoute>} />
            <Route path="/my-reports" element={<ProtectedRoute requiredRole="user"><UserReports /></ProtectedRoute>} />
            <Route path="/my-appointments" element={<ProtectedRoute requiredRole="user"><ViewAppointments /></ProtectedRoute>} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/chat" element={<ProtectedRoute requiredRole="user"><ChatWithAdmin /></ProtectedRoute>} />

            {/* Provider Public Routes */}
            <Route path="/provider/register" element={<ProviderRegister />} />
            <Route path="/provider/waiting" element={<ProviderWaiting />} />

            {/* Provider Protected Routes */}
            <Route path="/provider/dashboard" element={<ProtectedRoute requiredRole="provider"><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/provider/bookings" element={<ProtectedRoute requiredRole="provider"><ProviderBookings /></ProtectedRoute>} />
            <Route path="/provider/availability" element={<ProtectedRoute requiredRole="provider"><ProviderAvailability /></ProtectedRoute>} />
            <Route path="/provider/profile" element={<ProtectedRoute requiredRole="provider"><ProviderProfile /></ProtectedRoute>} />
            <Route path="/provider/settings" element={<ProtectedRoute requiredRole="provider"><ProviderServiceSettings /></ProtectedRoute>} />
            <Route path="/provider/notifications" element={<ProtectedRoute requiredRole="provider"><ProviderNotifications /></ProtectedRoute>} />
            <Route path="/provider/chat" element={<ProtectedRoute requiredRole="provider"><ProviderChat /></ProtectedRoute>} />
          </Routes>
        </UserThemeProvider>
      </AdminThemeProvider>
    </Router>
  );
}

export default App;
