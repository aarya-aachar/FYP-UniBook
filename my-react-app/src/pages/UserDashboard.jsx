import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { getUserBookings } from "../services/bookingService";
import { getProfile } from "../services/authService";

const UserDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getProfile());
    const fetchBookings = async () => {
      try {
        const data = await getUserBookings();
        // filter out cancelled
        const active = data.filter(b => b.status !== 'cancelled');
        setAppointments(active.slice(0, 3)); // show top 3 upcoming
      } catch (err) {
        console.error("Failed to load dashboard bookings", err);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-14 px-6 text-center">
          <h1 className="text-4xl font-extrabold mb-2">
            Welcome Back, {user?.name || 'User'} 👋
          </h1>
          <p className="text-lg">
            Manage your appointments and profile with ease
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link
              to="/services"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 p-8 text-center"
            >
              <img
                src="/images/booking-icon.png"
                alt="Book"
                className="h-16 w-16 mx-auto mb-4"
              />
              <h2 className="text-xl font-bold mb-1">
                Book Appointment
              </h2>
              <p className="text-gray-600">
                Find and book services easily
              </p>
            </Link>

            <Link
              to="/profile"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 p-8 text-center"
            >
              <img
                src="/images/profile-icon.png"
                alt="Profile"
                className="h-16 w-16 mx-auto mb-4"
              />
              <h2 className="text-xl font-bold mb-1">
                My Profile
              </h2>
              <p className="text-gray-600">
                Update your personal information
              </p>
            </Link>

            <Link
              to="/appointments"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 p-8 text-center"
            >
              <img
                src="/images/appointments-icon.png"
                alt="Appointments"
                className="h-16 w-16 mx-auto mb-4"
              />
              <h2 className="text-xl font-bold mb-1">
                My Appointments
              </h2>
              <p className="text-gray-600">
                View or check appointment status
              </p>
            </Link>
          </div>

          {/* Upcoming Appointments */}
          <h2 className="text-2xl font-bold mb-6">
            Upcoming Appointments
          </h2>

          {appointments.length ? (
            appointments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl shadow-md p-5 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 border-blue-500 hover:shadow-lg transition"
              >
                <div>
                  <h3 className="font-bold text-lg">
                    {a.provider_name}
                  </h3>
                  <p className="text-gray-600">
                    {a.category} • {new Date(a.booking_date).toLocaleDateString()} at {a.booking_time}
                  </p>
                </div>

                <Link
                  to={`/dashboard/user/appointments`}
                  className="mt-4 md:mt-0 bg-blue-50 text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-100 transition"
                >
                  Manage
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              No upcoming appointments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
