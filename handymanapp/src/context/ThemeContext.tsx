import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  isDarkMode: boolean;
  primaryColor: string;
  accentColor: string;
  toggleDarkMode: () => void;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [primaryColor, setPrimaryColorState] = useState('#2196F3');
  const [accentColor, setAccentColorState] = useState('#FF9800');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };

  const value: ThemeContextType = {
    isDarkMode,
    primaryColor,
    accentColor,
    toggleDarkMode,
    setPrimaryColor,
    setAccentColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}