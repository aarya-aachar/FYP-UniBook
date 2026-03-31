// src/components/UserSidebar.jsx
import { Link, useNavigate } from "react-router-dom";

const UserSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="bg-gray-50 w-64 min-h-screen p-6 shadow-lg flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          UniBook
        </h2>

        <nav className="flex flex-col space-y-3">
          <Link
            to="/dashboard/user"
            className="hover:bg-blue-100 hover:text-blue-700 p-2 rounded transition"
          >
            Dashboard
          </Link>

          <Link
            to="/services"
            className="hover:bg-blue-100 hover:text-blue-700 p-2 rounded transition"
          >
            Book Appointment
          </Link>

          <Link
            to="/my-appointments"
            className="hover:bg-blue-100 hover:text-blue-700 p-2 rounded transition"
          >
            My Appointments
          </Link>

          {/* ✅ NEW REPORTS LINK */}
          <Link
            to="/my-reports"
            className="hover:bg-blue-100 hover:text-blue-700 p-2 rounded transition"
          >
            My Reports
          </Link>

          <Link
            to="/profile"
            className="hover:bg-blue-100 hover:text-blue-700 p-2 rounded transition"
          >
            My Profile
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
      >
        Logout
      </button>
    </div>
  );
};

export default UserSidebar;
