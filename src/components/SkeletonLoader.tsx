import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animationDuration?: number;
}

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animationDuration = 1000,
}: SkeletonLoaderProps) {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationDuration / 2,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue, animationDuration]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surfaceVariant, theme.colors.outline],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

// Pre-built skeleton components for common use cases
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <SkeletonLoader width="60%" height={16} style={styles.title} />
      <SkeletonLoader width="100%" height={12} style={styles.subtitle} />
      <SkeletonLoader width="80%" height={12} style={styles.subtitle} />
      <View style={styles.cardFooter}>
        <SkeletonLoader width={80} height={32} borderRadius={16} />
        <SkeletonLoader width={60} height={14} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={styles.listItemContent}>
            <SkeletonLoader width="70%" height={14} style={styles.listItemTitle} />
            <SkeletonLoader width="50%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonProfile() {
  return (
    <View style={styles.profile}>
      <SkeletonLoader width={80} height={80} borderRadius={40} style={styles.avatar} />
      <SkeletonLoader width="60%" height={20} style={styles.profileName} />
      <SkeletonLoader width="40%" height={14} style={styles.profileRole} />
      <View style={styles.profileStats}>
        <View style={styles.stat}>
          <SkeletonLoader width={30} height={24} />
          <SkeletonLoader width={40} height={12} />
        </View>
        <View style={styles.stat}>
          <SkeletonLoader width={30} height={24} />
          <SkeletonLoader width={40} height={12} />
        </View>
        <View style={styles.stat}>
          <SkeletonLoader width={30} height={24} />
          <SkeletonLoader width={40} height={12} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemTitle: {
    marginBottom: 4,
  },
  profile: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  profileName: {
    marginBottom: 8,
  },
  profileRole: {
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
    gap: 8,
  },
});