import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export const AdminThemeProvider = ({ children }) => {
  const [adminTheme, setAdminTheme] = useState(() => {
    return localStorage.getItem('adminTheme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('adminTheme', adminTheme);
  }, [adminTheme]);

  const toggleAdminTheme = () => {
    setAdminTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AdminThemeContext.Provider value={{ adminTheme, toggleAdminTheme, setAdminTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};
