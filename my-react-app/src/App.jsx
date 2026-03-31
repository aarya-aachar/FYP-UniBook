import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import About from './pages/About';
import Contact from './pages/Contact';
import Payment from "./pages/Payment";
import UserReports from "./pages/UserReports";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:serviceName" element={<ServiceProviders />} />
        <Route path="/service/:providerId" element={<ServiceDetails />} />
        <Route path="/booking/:providerId" element={<Booking />} />
        <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/user/appointments" element={<ViewAppointments />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/admin/users" element={<ManageUsers />} />
        <Route path="/dashboard/admin/providers" element={<ManageProviders />} />
        <Route path="/dashboard/admin/bookings" element={<ManageBookings />} />
        <Route path="/dashboard/admin/reports" element={<Reports />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
<Route path="/payment/:providerId" element={<Payment />} />

<Route path="/my-reports" element={<UserReports />} />

  <Route path="/my-appointments" element={<ViewAppointments />} />


      </Routes>
    </Router>
  );
}

export default App;
