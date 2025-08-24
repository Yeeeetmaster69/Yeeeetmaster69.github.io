import { MD3LightTheme } from 'react-native-paper';
import { AccessibilityConfig } from './accessibility';

// Enhanced theme for better accessibility and older user friendliness
export const accessibleTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Higher contrast colors
    primary: '#1976D2', // Darker blue for better contrast
    onPrimary: '#FFFFFF',
    secondary: '#388E3C', // Darker green
    onSecondary: '#FFFFFF',
    tertiary: '#F57C00', // Darker orange
    onTertiary: '#FFFFFF',
    error: '#D32F2F', // Darker red
    onError: '#FFFFFF',
    errorContainer: '#FFEBEE',
    onErrorContainer: '#B71C1C',
    background: '#FFFFFF',
    onBackground: '#212121', // Darker text
    surface: '#FAFAFA',
    onSurface: '#212121',
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#424242',
    outline: '#757575',
    outlineVariant: '#BDBDBD',
    scrim: '#000000',
    inverseSurface: '#212121',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#90CAF9',
    // Custom colors for accessibility
    success: '#2E7D32',
    onSuccess: '#FFFFFF',
    warning: '#F57C00',
    onWarning: '#FFFFFF',
    info: '#1976D2',
    onInfo: '#FFFFFF',
  },
  // Larger, more readable fonts
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: {
      fontFamily: 'System',
      fontSize: 32,
      fontWeight: '400' as const,
      lineHeight: 44,
      letterSpacing: 0,
    },
    displayMedium: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '400' as const,
      lineHeight: 36,
      letterSpacing: 0,
    },
    displaySmall: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '400' as const,
      lineHeight: 32,
      letterSpacing: 0,
    },
    headlineLarge: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    titleLarge: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 22,
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      letterSpacing: 0.4,
    },
    labelLarge: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontFamily: 'System',
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },
};

// High contrast theme for users with vision difficulties
export const highContrastTheme = {
  ...accessibleTheme,
  colors: {
    ...accessibleTheme.colors,
    ...AccessibilityConfig.colors.highContrast,
  },
};

// Common accessible styles that can be used throughout the app
export const accessibleStyles = {
  // Buttons
  primaryButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  secondaryButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
  },
  iconButton: {
    minHeight: 48,
    minWidth: 48,
    borderRadius: 24,
  },
  
  // Text inputs
  textInput: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  
  // Cards
  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Lists
  listItem: {
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Containers
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600' as const,
  },
};

export default accessibleTheme;