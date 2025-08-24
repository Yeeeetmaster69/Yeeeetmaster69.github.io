
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { AccessibilityInfo } from 'react-native';
import { accessibleTheme, highContrastTheme } from '../utils/theme';
import { useAccessibility } from '../utils/accessibility';

type ThemeConfig = { 
  primary: string; 
  accent: string; 
  highContrast: boolean;
  fontSize: 'small' | 'standard' | 'large' | 'extraLarge';
};

type Ctx = { 
  themeConfig: ThemeConfig; 
  setThemeConfig: (c: Partial<ThemeConfig>) => void;
  theme: any;
  isAccessibilityEnabled: boolean;
};

const ThemeCtx = createContext<Ctx | null>(null);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>({ 
    primary: '#1976D2', 
    accent: '#388E3C',
    highContrast: false,
    fontSize: 'standard'
  });
  
  const { isScreenReaderEnabled, isReduceMotionEnabled } = useAccessibility();
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  useEffect(() => {
    setIsAccessibilityEnabled(isScreenReaderEnabled);
  }, [isScreenReaderEnabled]);

  const setThemeConfig = (newConfig: Partial<ThemeConfig>) => {
    setThemeConfigState(prev => ({ ...prev, ...newConfig }));
  };

  const theme = useMemo(() => {
    const baseTheme = themeConfig.highContrast ? highContrastTheme : accessibleTheme;
    
    return {
      ...baseTheme,
      colors: { 
        ...baseTheme.colors, 
        primary: themeConfig.primary, 
        secondary: themeConfig.accent 
      },
      // Adjust animation durations for accessibility
      animation: {
        ...baseTheme.animation,
        scale: isReduceMotionEnabled ? 0 : 1, // Disable animations if reduce motion is enabled
      },
      // Add custom accessibility properties
      accessibility: {
        highContrast: themeConfig.highContrast,
        fontSize: themeConfig.fontSize,
        screenReader: isScreenReaderEnabled,
        reduceMotion: isReduceMotionEnabled,
      }
    };
  }, [themeConfig, isScreenReaderEnabled, isReduceMotionEnabled]);

  return (
    <ThemeCtx.Provider value={{
      themeConfig, 
      setThemeConfig, 
      theme,
      isAccessibilityEnabled
    }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeCtx.Provider>
  );
};

export const useThemeConfig = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('ThemeContext missing');
  return ctx;
};
