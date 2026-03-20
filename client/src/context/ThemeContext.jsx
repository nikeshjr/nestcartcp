import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Load user-specific theme on login
  useEffect(() => {
    if (user) {
      const savedUserTheme = localStorage.getItem(`theme_user_${user.id}`);
      if (savedUserTheme) {
        setIsDarkMode(savedUserTheme === 'dark');
      }
    }
  }, [user?.id]); // Only run when user-id changes

  // Update visual theme
  useEffect(() => {
    const root = window.document.documentElement;
    const themeStr = isDarkMode ? 'dark' : 'light';
    root.setAttribute('data-theme', themeStr);
    
    // Always update session/guest theme
    localStorage.setItem('theme', themeStr);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      const themeStr = next ? 'dark' : 'light';
      
      // Update session/guest theme
      localStorage.setItem('theme', themeStr);
      
      // If logged in, update user-specific preference
      if (user) {
        localStorage.setItem(`theme_user_${user.id}`, themeStr);
      }
      
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
