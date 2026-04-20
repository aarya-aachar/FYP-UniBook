/**
 * The Security Guard (Role-Based Access Control)
 * 
 * relative path: /src/components/ProtectedRoute.jsx
 * 
 * This component acts as the "Bouncer" for the application. 
 * Instead of checking for a login on every single page, we wrap our 
 * routes in this component.
 * 
 * Logic:
 * 1. Checks for a valid token and user profile.
 * 2. Checks if the user's role (Admin, Provider, User) matches the page requirement.
 * 3. Redirects to Login if anything is missing.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { getProfile, logout } from '../services/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const user = getProfile();

  /**
   * --- LOGIN GATE ---
   * If there is no user profile or no token in storage, the user 
   * is definitely not logged in.
   */
  const token = localStorage.getItem('token');
  if (!user || !token) {
    // We remember where the user was trying to go so we can send them 
    // back there after they log in (using the 'state' prop).
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /**
   * --- ROLE ENFORCEMENT ---
   * Even if you're logged in, you can't access pages that aren't for you.
   * (e.g. A regular customer cannot open the Admin Dashboard).
   */
  if (requiredRole) {
    const currentRole = String(user.role || '').toLowerCase().trim();
    const targetRole = String(requiredRole).toLowerCase().trim();

    if (currentRole !== targetRole) {
      // Security violation: The user is trying to enter a restricted area.
      console.warn(`[RBAC] Security hit: User role '${currentRole}' attempted access to route requiring '${targetRole}'.`);
      
      // We send them back to the login page to re-authenticate or switch accounts.
      return <Navigate to="/login" replace />;
    }
  }

  // If all checks pass, we let the user "Enter" the page
  return children;
};

export default ProtectedRoute;
