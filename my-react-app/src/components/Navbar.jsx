/**
 * The Primary Navigation Bar
 * 
 * relative path: /src/components/Navbar.jsx
 * 
 * This is the high-level header seen on the homepage and public pages.
 * It intelligently swaps buttons based on whether the visitor is a 
 * guest, a regular customer, or an administrator.
 */

import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  // We grab 'user' from context to know what links to show
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Brand Logo - clicks back to home */}
      <Link to="/" className="text-2xl font-bold">UniBook</Link>
      
      <div className="space-x-4 flex items-center">
        {/* Core public pages */}
        <Link to="/services" className="hover:underline">Services</Link>
        <Link to="/about" className="hover:underline">About</Link>
        <Link to="/contact" className="hover:underline">Contact</Link>
        
        {/*
            --- CONDITIONAL LINKS ---
            If logged in: Show Dashboards & Profile.
            If guest: Show Login & Signup.
        */}
        {user ? (
          <>
            {user.role === 'admin' ? (
              <Link to="/dashboard/admin" className="hover:underline">Admin Dashboard</Link>
            ) : (
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            )}
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
