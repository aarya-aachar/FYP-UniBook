import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth info here if needed
    // e.g., localStorage.removeItem('adminToken');
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="bg-gray-100 w-64 min-h-screen p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6">UniBook</h2>
        <nav className="flex flex-col space-y-3">
          <Link to="/dashboard/admin" className="hover:bg-blue-600 hover:text-white p-2 rounded">Dashboard</Link>
          <Link to="/dashboard/admin/providers" className="hover:bg-blue-600 hover:text-white p-2 rounded">Manage Providers</Link>
          <Link to="/dashboard/admin/users" className="hover:bg-blue-600 hover:text-white p-2 rounded">Manage Users</Link>
          <Link to="/dashboard/admin/bookings" className="hover:bg-blue-600 hover:text-white p-2 rounded">Manage Bookings</Link>
          <Link to="/dashboard/admin/reports" className="hover:bg-blue-600 hover:text-white p-2 rounded">Reports</Link>
        </nav>
      </div>

      {/* Logout button at the bottom */}
    <button
        onClick={handleLogout}
        className="mt-6 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
