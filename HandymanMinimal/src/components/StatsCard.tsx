import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  color?: string;
  onPress?: () => void;
}

export default function StatsCard({ title, value, subtitle, trend, icon, color = '#2196f3', onPress }: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = () => {
    if (!trend) return color;
    return trend.isPositive ? '#4caf50' : '#f44336';
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="bodyMedium" style={styles.title}>{title}</Text>
          {icon && <Text style={[styles.icon, { color }]}>{icon}</Text>}
        </View>
        
        <Text variant="headlineMedium" style={[styles.value, { color }]}>
          {formatValue(value)}
        </Text>
        
        {subtitle && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
        
        {trend && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trend, { color: getTrendColor() }]}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value).toFixed(1)}%
            </Text>
            <Text variant="bodySmall" style={styles.trendLabel}>vs last period</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    elevation: 2,
    minHeight: 120,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  icon: {
    fontSize: 24,
  },
  value: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trend: {
    fontWeight: '600',
    fontSize: 12,
  },
  trendLabel: {
    color: '#888',
    fontSize: 11,
  },
});