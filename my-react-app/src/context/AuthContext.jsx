/**
 * Identity & Session Vault (Auth Context)
 * 
 * relative path: /src/context/AuthContext.jsx
 * 
 * This is arguably the most important data bridge in the frontend. 
 * It remembers who is logged in and what their role is (User, Admin, or Provider).
 * 
 * Benefits:
 * - Prevents users from having to log in every time they move to a new page.
 * - Provides the `user` object to any component that needs it (like the profile page).
 */

import { createContext, useState, useEffect } from 'react';
import { getProfile } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // The current logged-in identity
  const [loading, setLoading] = useState(true); // Prevents "Flickering" on page refresh

  useEffect(() => {
    /** 
     * fetchUser
     * As soon as the app starts, we check local storage to see if there is 
     * a valid session token. If found, we restore the user's profile.
     */
    const fetchUser = () => {
      try {
        const profile = getProfile();
        setUser(profile);
      } catch (err) {
        // If the token is invalid or missing, we treat the user as a Guest
        console.error("AuthContext sync error:", err);
        setUser(null);
      } finally {
        // Once the check is done, we tell the app it is "Ready" to render pages
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
