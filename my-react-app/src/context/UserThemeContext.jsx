import React, { createContext, useContext, useState, useEffect } from 'react';

const UserThemeContext = createContext();

export const UserThemeProvider = ({ children }) => {
  const [userTheme, setUserTheme] = useState(() => {
    return localStorage.getItem('userTheme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('userTheme', userTheme);
  }, [userTheme]);

  const toggleUserTheme = () => {
    setUserTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <UserThemeContext.Provider value={{ userTheme, toggleUserTheme, setUserTheme }}>
      {children}
    </UserThemeContext.Provider>
  );
};

export const useUserTheme = () => {
  const context = useContext(UserThemeContext);
  if (!context) {
    throw new Error('useUserTheme must be used within a UserThemeProvider');
  }
  return context;
};
