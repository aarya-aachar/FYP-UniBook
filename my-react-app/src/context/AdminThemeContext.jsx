/**
 * Visual Styling Control (Admin Theme Context)
 * 
 * relative path: /src/context/AdminThemeContext.jsx
 * 
 * This file manages the "Look and Feel" of the Admin Dashboard.
 * It allows admins to switch between a Pro-Dark mode and a Classic-Light mode.
 * 
 * Logic:
 * - It reads the user's last preference from browser storage on startup.
 * - It provides a simple `toggleAdminTheme` function for the UI buttons.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export const AdminThemeProvider = ({ children }) => {
  // Load the admin's saved choice, default to 'dark' for a premium look
  const [adminTheme, setAdminTheme] = useState(() => {
    return localStorage.getItem('adminTheme') || 'dark';
  });

  // Whenever the theme changes, we save it immediately to the browser
  useEffect(() => {
    localStorage.setItem('adminTheme', adminTheme);
  }, [adminTheme]);

  /**
   * toggleAdminTheme
   * Flips the switch between light and dark.
   */
  const toggleAdminTheme = () => {
    setAdminTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AdminThemeContext.Provider value={{ adminTheme, toggleAdminTheme, setAdminTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

// Custom "Hook" to make using the theme super easy in components
export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};
