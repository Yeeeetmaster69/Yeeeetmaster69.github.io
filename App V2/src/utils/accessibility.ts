import React from 'react';
import { AccessibilityInfo, Alert } from 'react-native';

export const AccessibilityConfig = {
  // Minimum touch target size (48dp recommended by Android/Apple)
  minTouchTargetSize: 48,
  
  // Enhanced contrast colors for better visibility
  colors: {
    highContrast: {
      primary: '#000000',
      onPrimary: '#FFFFFF',
      secondary: '#2E2E2E',
      onSecondary: '#FFFFFF',
      error: '#B00020',
      onError: '#FFFFFF',
      background: '#FFFFFF',
      onBackground: '#000000',
      surface: '#F5F5F5',
      onSurface: '#000000',
    },
    standard: {
      primary: '#6200EA',
      onPrimary: '#FFFFFF',
      secondary: '#03DAC6',
      onSecondary: '#000000',
      error: '#B00020',
      onError: '#FFFFFF',
      background: '#FFFFFF',
      onBackground: '#000000',
      surface: '#FFFFFF',
      onSurface: '#000000',
    }
  },
  
  // Font sizes for different accessibility needs
  fontSizes: {
    small: {
      caption: 10,
      body: 12,
      label: 12,
      title: 14,
      headline: 16,
    },
    standard: {
      caption: 12,
      body: 14,
      label: 14,
      title: 16,
      headline: 20,
    },
    large: {
      caption: 14,
      body: 16,
      label: 16,
      title: 18,
      headline: 24,
    },
    extraLarge: {
      caption: 16,
      body: 18,
      label: 18,
      title: 22,
      headline: 28,
    }
  }
};

export const AccessibilityUtils = {
  // Check if screen reader is enabled
  isScreenReaderEnabled: async (): Promise<boolean> => {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch (error) {
      console.warn('Error checking screen reader status:', error);
      return false;
    }
  },

  // Check if reduced motion is preferred
  isReduceMotionEnabled: async (): Promise<boolean> => {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.warn('Error checking reduce motion status:', error);
      return false;
    }
  },

  // Announce important changes to screen readers
  announceForAccessibility: (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  },

  // Show accessible error alerts
  showAccessibleAlert: (title: string, message: string, actions?: any[]) => {
    Alert.alert(
      title,
      message,
      actions || [{ text: 'OK', onPress: () => {} }],
      { 
        cancelable: true,
        userInterfaceStyle: 'light' // Ensures good contrast
      }
    );
  },

  // Get recommended button style for accessibility
  getAccessibleButtonStyle: (baseStyle: any = {}) => ({
    ...baseStyle,
    minHeight: AccessibilityConfig.minTouchTargetSize,
    minWidth: AccessibilityConfig.minTouchTargetSize,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  }),

  // Get accessible text style
  getAccessibleTextStyle: (variant: string, fontSize: 'small' | 'standard' | 'large' | 'extraLarge' = 'standard') => {
    const sizes = AccessibilityConfig.fontSizes[fontSize];
    const textStyle: any = {};
    
    switch (variant) {
      case 'caption':
        textStyle.fontSize = sizes.caption;
        break;
      case 'body':
        textStyle.fontSize = sizes.body;
        break;
      case 'label':
        textStyle.fontSize = sizes.label;
        textStyle.fontWeight = '500';
        break;
      case 'title':
        textStyle.fontSize = sizes.title;
        textStyle.fontWeight = '600';
        break;
      case 'headline':
        textStyle.fontSize = sizes.headline;
        textStyle.fontWeight = 'bold';
        break;
      default:
        textStyle.fontSize = sizes.body;
    }
    
    return {
      ...textStyle,
      lineHeight: textStyle.fontSize * 1.4, // Good line height for readability
      letterSpacing: 0.25, // Slight letter spacing for better legibility
    };
  }
};

// Hook to manage accessibility preferences
export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = React.useState(false);
  const [fontScale, setFontScale] = React.useState('standard' as 'small' | 'standard' | 'large' | 'extraLarge');

  React.useEffect(() => {
    const initAccessibility = async () => {
      const screenReader = await AccessibilityUtils.isScreenReaderEnabled();
      const reduceMotion = await AccessibilityUtils.isReduceMotionEnabled();
      
      setIsScreenReaderEnabled(screenReader);
      setIsReduceMotionEnabled(reduceMotion);
    };

    initAccessibility();

    // Listen for accessibility changes
    const screenReaderListener = AccessibilityInfo.addEventListener('screenReaderChanged', setIsScreenReaderEnabled);
    const reduceMotionListener = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduceMotionEnabled);

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    };
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    fontScale,
    setFontScale,
    announceForAccessibility: AccessibilityUtils.announceForAccessibility,
    showAccessibleAlert: AccessibilityUtils.showAccessibleAlert,
  };
};