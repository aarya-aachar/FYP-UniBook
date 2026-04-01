import { Navigate, useLocation } from 'react-router-dom';
import { getProfile, logout } from '../services/authService';

/**
 * Secures routes by guaranteeing the user is logged in AND possesses the required role.
 * Any mismatch forces a session purge and hard redirect to /login.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const user = getProfile();

  // 1. Not logged in -> Redirect seamlessly to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check
  const currentRole = String(user.role || '').toLowerCase().trim();
  const targetRole = String(requiredRole || '').toLowerCase().trim();

  if (currentRole !== targetRole) {
    // Security violation: user attempting to access wrong role page
    // Purge session completely and explicitly kick out to login
    console.warn(`[RBAC] Security hit: User role '${currentRole}' attempted access to route requiring '${targetRole}'. Session purged.`);
    logout();
    return <Navigate to="/login" replace />;
  }

  // 3. Authorized
  return children;
};

export default ProtectedRoute;
