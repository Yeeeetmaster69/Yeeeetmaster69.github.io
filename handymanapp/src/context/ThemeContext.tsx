
import React, { createContext, useContext, useState, useMemo } from 'react';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

type ThemeConfig = { primary: string; accent: string; };
type Ctx = { themeConfig: ThemeConfig; setThemeConfig: (c:ThemeConfig)=>void; };
const ThemeCtx = createContext<Ctx | null>(null);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({ primary: '#16a34a', accent: '#0ea5e9' });
  const theme = useMemo(() => ({
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: themeConfig.primary, secondary: themeConfig.accent }
  }), [themeConfig]);

  return (
    <ThemeCtx.Provider value={{themeConfig, setThemeConfig}}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeCtx.Provider>
  );
};

export const useThemeConfig = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('ThemeContext missing');
  return ctx;
};
