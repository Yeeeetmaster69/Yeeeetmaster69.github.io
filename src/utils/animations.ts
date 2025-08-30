import { Animated, Easing } from 'react-native';

/**
 * Commercial-grade animation utilities for smooth transitions
 */

export interface AnimationConfig {
  duration?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

export class AnimationUtils {
  /**
   * Fade in animation
   */
  static fadeIn(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration: config.duration || 300,
      easing: config.easing || Easing.out(Easing.ease),
      useNativeDriver: config.useNativeDriver ?? true,
    });
  }

  /**
   * Fade out animation
   */
  static fadeOut(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration: config.duration || 300,
      easing: config.easing || Easing.in(Easing.ease),
      useNativeDriver: config.useNativeDriver ?? true,
    });
  }

  /**
   * Slide in from right animation
   */
  static slideInRight(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration: config.duration || 400,
      easing: config.easing || Easing.out(Easing.back(1.1)),
      useNativeDriver: config.useNativeDriver ?? true,
    });
  }

  /**
   * Slide out to right animation
   */
  static slideOutRight(
    animatedValue: Animated.Value,
    screenWidth: number,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue: screenWidth,
      duration: config.duration || 300,
      easing: config.easing || Easing.in(Easing.ease),
      useNativeDriver: config.useNativeDriver ?? true,
    });
  }

  /**
   * Scale in animation (for buttons and cards)
   */
  static scaleIn(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.spring(animatedValue, {
      toValue: 1,
      tension: 150,
      friction: 8,
      useNativeDriver: config.useNativeDriver ?? true,
    });
  }

  /**
   * Scale out animation
   */
  static scaleOut(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration: config.duration || 200,
      easing: config.easing || Easing.in(Easing.ease),
      useNativeDriver: config.useNativeDriver ?? true,
    });
  }

  /**
   * Pulse animation for attention
   */
  static pulse(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: config.duration || 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: config.useNativeDriver ?? true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: config.duration || 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: config.useNativeDriver ?? true,
        }),
      ])
    );
  }

  /**
   * Bounce animation for success states
   */
  static bounce(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.spring(animatedValue, {
      toValue: 1,
      tension: 200,
      friction: 3,
      useNativeDriver: config.useNativeDriver ?? true,
    });
  }

  /**
   * Shake animation for errors
   */
  static shake(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: config.useNativeDriver ?? true,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 50,
        useNativeDriver: config.useNativeDriver ?? true,
      }),
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: config.useNativeDriver ?? true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: config.useNativeDriver ?? true,
      }),
    ]);
  }

  /**
   * Stagger animation for lists
   */
  static stagger(
    animations: Animated.CompositeAnimation[],
    delay: number = 100
  ): Animated.CompositeAnimation {
    return Animated.stagger(delay, animations);
  }

  /**
   * Page transition animations
   */
  static pageTransition = {
    fadeInOut: (progress: Animated.AnimatedAddition<number>) => ({
      opacity: progress,
    }),
    
    slideLeftRight: (progress: Animated.AnimatedAddition<number>, screenWidth: number) => ({
      transform: [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [screenWidth, 0],
          }),
        },
      ],
    }),
    
    scaleFromCenter: (progress: Animated.AnimatedAddition<number>) => ({
      opacity: progress,
      transform: [
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
    }),
  };

  /**
   * Loading animations
   */
  static loadingSpinner(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: config.duration || 1000,
        easing: Easing.linear,
        useNativeDriver: config.useNativeDriver ?? true,
      })
    );
  }

  /**
   * Progress bar animation
   */
  static progressBar(
    animatedValue: Animated.Value,
    toValue: number,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration: config.duration || 500,
      easing: config.easing || Easing.out(Easing.ease),
      useNativeDriver: false, // Layout animations can't use native driver
    });
  }

  /**
   * Card flip animation
   */
  static flipCard(
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 90,
        duration: (config.duration || 600) / 2,
        easing: Easing.out(Easing.ease),
        useNativeDriver: config.useNativeDriver ?? true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: (config.duration || 600) / 2,
        easing: Easing.in(Easing.ease),
        useNativeDriver: config.useNativeDriver ?? true,
      }),
    ]);
  }
}

/**
 * Hook for managing common animation states
 */
export const useAnimatedValue = (initialValue: number = 0) => {
  const animatedValue = new Animated.Value(initialValue);
  
  return {
    value: animatedValue,
    fadeIn: (config?: AnimationConfig) => AnimationUtils.fadeIn(animatedValue, config),
    fadeOut: (config?: AnimationConfig) => AnimationUtils.fadeOut(animatedValue, config),
    scaleIn: (config?: AnimationConfig) => AnimationUtils.scaleIn(animatedValue, config),
    scaleOut: (config?: AnimationConfig) => AnimationUtils.scaleOut(animatedValue, config),
    pulse: (config?: AnimationConfig) => AnimationUtils.pulse(animatedValue, config),
    bounce: (config?: AnimationConfig) => AnimationUtils.bounce(animatedValue, config),
    shake: (config?: AnimationConfig) => AnimationUtils.shake(animatedValue, config),
  };
};

/**
 * Predefined easing curves for different interaction types
 */
export const EasingCurves = {
  // Material Design easing curves
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
  
  // Custom curves for commercial feel
  commercial: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  smooth: Easing.bezier(0.165, 0.84, 0.44, 1),
  bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
};