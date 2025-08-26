
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeConfig {
  primary: string;
  accent: string;
  mode: 'light' | 'dark' | 'auto';
  animations: boolean;
  reducedMotion: boolean;
}

interface ThemeContextType {
  themeConfig: ThemeConfig;
  setThemeConfig: (config: ThemeConfig) => void;
  isDark: boolean;
  toggleTheme: () => void;
  resetToDefault: () => void;
}

const defaultThemeConfig: ThemeConfig = {
  primary: '#16a34a',
  accent: '#0ea5e9',
  mode: 'auto',
  animations: true,
  reducedMotion: false,
};

const ThemeCtx = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultThemeConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme config from storage on mount
  useEffect(() => {
    loadThemeConfig();
  }, []);

  // Save theme config when it changes
  useEffect(() => {
    if (isLoaded) {
      saveThemeConfig(themeConfig);
    }
  }, [themeConfig, isLoaded]);

  const loadThemeConfig = async () => {
    try {
      const stored = await AsyncStorage.getItem('themeConfig');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        setThemeConfig({ ...defaultThemeConfig, ...parsedConfig });
      }
    } catch (error) {
      console.warn('Error loading theme config:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveThemeConfig = async (config: ThemeConfig) => {
    try {
      await AsyncStorage.setItem('themeConfig', JSON.stringify(config));
    } catch (error) {
      console.warn('Error saving theme config:', error);
    }
  };

  const isDark = useMemo(() => {
    if (themeConfig.mode === 'dark') return true;
    if (themeConfig.mode === 'light') return false;
    return systemColorScheme === 'dark';
  }, [themeConfig.mode, systemColorScheme]);

  const theme = useMemo(() => {
    const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
    
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: themeConfig.primary,
        secondary: themeConfig.accent,
        // Custom colors for commercial features
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
        // Surface variants for cards and sections
        surfaceVariant: isDark ? '#2c2c2c' : '#f5f5f5',
        outline: isDark ? '#404040' : '#e0e0e0',
        // Payment status colors
        paid: '#4caf50',
        pending: '#ff9800',
        overdue: '#f44336',
        cancelled: '#9e9e9e',
      },
      // Animation settings
      animation: {
        scale: themeConfig.animations && !themeConfig.reducedMotion ? 1.0 : 0.0,
        defaultAnimationDuration: themeConfig.reducedMotion ? 0 : 300,
      },
      // Custom spacing and dimensions
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      // Typography enhancements
      fonts: {
        ...baseTheme.fonts,
        // Custom font sizes for commercial features
        currency: {
          fontSize: 24,
          fontWeight: 'bold' as const,
        },
        timer: {
          fontSize: 48,
          fontWeight: 'bold' as const,
          fontFamily: 'monospace',
        },
      },
    };
  }, [themeConfig, isDark]);

  const handleSetThemeConfig = (newConfig: ThemeConfig) => {
    setThemeConfig(newConfig);
  };

  const toggleTheme = () => {
    const newMode = themeConfig.mode === 'light' ? 'dark' : 
                   themeConfig.mode === 'dark' ? 'auto' : 'light';
    setThemeConfig({ ...themeConfig, mode: newMode });
  };

  const resetToDefault = () => {
    setThemeConfig(defaultThemeConfig);
  };

  return (
    <ThemeCtx.Provider value={{
      themeConfig,
      setThemeConfig: handleSetThemeConfig,
      isDark,
      toggleTheme,
      resetToDefault,
    }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeCtx.Provider>
  );
};

export const useThemeConfig = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useThemeConfig must be used within ThemeProvider');
  return ctx;
};

// Hook to get the current theme
export const useAppTheme = () => {
  return useContext(ThemeCtx)?.isDark ? 'dark' : 'light';
};

// Pre-defined theme presets for commercial use
export const themePresets = {
  professional: {
    primary: '#1976d2',
    accent: '#ffc107',
    mode: 'light' as const,
    animations: true,
    reducedMotion: false,
  },
  nature: {
    primary: '#4caf50',
    accent: '#8bc34a',
    mode: 'light' as const,
    animations: true,
    reducedMotion: false,
  },
  corporate: {
    primary: '#37474f',
    accent: '#607d8b',
    mode: 'light' as const,
    animations: false,
    reducedMotion: true,
  },
  vibrant: {
    primary: '#e91e63',
    accent: '#ff5722',
    mode: 'light' as const,
    animations: true,
    reducedMotion: false,
  },
  midnight: {
    primary: '#bb86fc',
    accent: '#03dac6',
    mode: 'dark' as const,
    animations: true,
    reducedMotion: false,
  },
};
