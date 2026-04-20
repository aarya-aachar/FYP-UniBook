/**
 * Client Visual Styling (User Theme Context)
 * 
 * relative path: /src/context/UserThemeContext.jsx
 * 
 * This file manages the "Vibe" of the main customer-facing website.
 * It lets users choose between a sleek Dark Mode or a bright Light Mode.
 * 
 * Logic:
 * - Saves the choice to `localStorage` so it persists after browsing away.
 * - Defaults to 'dark' because UniBook looks stunning in dark mode.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const UserThemeContext = createContext();

export const UserThemeProvider = ({ children }) => {
  // Check browser storage for a saved preference
  const [userTheme, setUserTheme] = useState(() => {
    return localStorage.getItem('userTheme') || 'dark';
  });

  // Keep the storage in sync with the state
  useEffect(() => {
    localStorage.setItem('userTheme', userTheme);
  }, [userTheme]);

  /**
   * toggleUserTheme
   * Switches the user's experience between Dark and Light.
   */
  const toggleUserTheme = () => {
    setUserTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <UserThemeContext.Provider value={{ userTheme, toggleUserTheme, setUserTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

// Custom hook for UI components to easily access the theme
export const useUserTheme = () => {
  const context = useContext(UserThemeContext);
  if (!context) {
    throw new Error('useUserTheme must be used within a UserThemeProvider');
  }
  return context;
};
