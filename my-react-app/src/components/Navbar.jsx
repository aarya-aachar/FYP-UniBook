import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold">UniBook</Link>
      <div className="space-x-4 flex items-center">
        <Link to="/services" className="hover:underline">Services</Link>
        <Link to="/about" className="hover:underline">About</Link>
        <Link to="/contact" className="hover:underline">Contact</Link>
        {user ? (
          <>
            {user.role === 'admin' ? <Link to="/dashboard/admin" className="hover:underline">Revenue Trends</Link> : <Link to="/dashboard/user" className="hover:underline">Dashboard</Link>}
            <Link to="/profile" className="hover:underline">Profile</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
