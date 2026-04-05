import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminThemeProvider } from './context/AdminThemeContext';
import { UserThemeProvider } from './context/UserThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Services from './pages/Services';
import ServiceProviders from './pages/ServiceProviders';
import ServiceDetails from './pages/ServiceDetails';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import UserDashboard from './pages/UserDashboard';
import ViewAppointments from './pages/ViewAppointments';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageProviders from './pages/ManageProviders';
import ManageBookings from './pages/ManageBookings';
import Reports from './pages/Reports';
import AdminNotifications from './pages/AdminNotifications';
import About from './pages/About';
import Contact from './pages/Contact';
import Payment from "./pages/Payment";
import UserReports from "./pages/UserReports";
import AdminProfile from "./pages/AdminProfile";
import UserNotifications from "./pages/UserNotifications";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <AdminThemeProvider>
        <UserThemeProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute requiredRole="user"><Profile /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/services/:serviceName" element={<ProtectedRoute><ServiceProviders /></ProtectedRoute>} />
            <Route path="/service/:providerId" element={<ProtectedRoute><ServiceDetails /></ProtectedRoute>} />
            <Route path="/booking/:providerId" element={<ProtectedRoute requiredRole="user"><Booking /></ProtectedRoute>} />
            <Route path="/booking-confirmation/:id" element={<ProtectedRoute requiredRole="user"><BookingConfirmation /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin/users" element={<ProtectedRoute requiredRole="admin"><ManageUsers /></ProtectedRoute>} />
            <Route path="/dashboard/admin/providers" element={<ProtectedRoute requiredRole="admin"><ManageProviders /></ProtectedRoute>} />
            <Route path="/dashboard/admin/bookings" element={<ProtectedRoute requiredRole="admin"><ManageBookings /></ProtectedRoute>} />
            <Route path="/dashboard/admin/reports" element={<ProtectedRoute requiredRole="admin"><Reports /></ProtectedRoute>} />
            <Route path="/dashboard/admin/notifications" element={<ProtectedRoute requiredRole="admin"><AdminNotifications /></ProtectedRoute>} />
            <Route path="/dashboard/admin/profile" element={<ProtectedRoute requiredRole="admin"><AdminProfile /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            
            <Route path="/notifications" element={<ProtectedRoute requiredRole="user"><UserNotifications /></ProtectedRoute>} />
            <Route path="/payment/:providerId" element={<ProtectedRoute requiredRole="user"><Payment /></ProtectedRoute>} />
            <Route path="/my-reports" element={<ProtectedRoute requiredRole="user"><UserReports /></ProtectedRoute>} />
            <Route path="/my-appointments" element={<ProtectedRoute requiredRole="user"><ViewAppointments /></ProtectedRoute>} />
          </Routes>
        </UserThemeProvider>
      </AdminThemeProvider>
    </Router>
  );
}

export default App;
