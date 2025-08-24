import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, Surface } from 'react-native-paper';
import StatsCard from '../../../components/StatsCard';
import { DashboardStats } from '../../../utils/types';
import { useNavigation } from '@react-navigation/native';

export default function DashboardTab() {
  const navigation = useNavigation();
  const [timeFrame, setTimeFrame] = useState('today');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const timeFrameOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  useEffect(() => {
    loadDashboardStats();
  }, [timeFrame]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockStats: DashboardStats = {
        totalJobs: 156,
        activeJobs: 8,
        completedJobs: 142,
        totalRevenue: 18750,
        totalClients: 45,
        totalWorkers: 6,
        averageJobValue: 120.19,
        monthlyRevenue: 4250,
        weeklyRevenue: 1200,
        dailyRevenue: 350
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRevenueByTimeFrame = () => {
    if (!stats) return 0;
    switch (timeFrame) {
      case 'today': return stats.dailyRevenue;
      case 'week': return stats.weeklyRevenue;
      case 'month': return stats.monthlyRevenue;
      case 'year': return stats.totalRevenue;
      default: return stats.dailyRevenue;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="titleLarge" style={styles.title}>
          Business Overview
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track your performance metrics
        </Text>
      </Surface>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Revenue Overview
          </Text>
          
          <SegmentedButtons
            value={timeFrame}
            onValueChange={setTimeFrame}
            buttons={timeFrameOptions}
            style={styles.segmentedButtons}
          />

          <View style={styles.statsGrid}>
            <StatsCard
              title="Revenue"
              value={formatCurrency(getRevenueByTimeFrame())}
              subtitle={`For ${timeFrame}`}
              icon="💰"
              color="#4caf50"
              trend={{ value: 12.5, isPositive: true }}
              onPress={() => navigation.navigate('Income' as never)}
            />
            <StatsCard
              title="Active Jobs"
              value={stats?.activeJobs || 0}
              subtitle="In progress"
              icon="🔧"
              color="#2196f3"
              onPress={() => navigation.navigate('AdminJobs' as never)}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Jobs"
              value={stats?.totalJobs || 0}
              subtitle="All time"
              icon="📋"
              color="#ff9800"
              trend={{ value: 8.2, isPositive: true }}
            />
            <StatsCard
              title="Avg Job Value"
              value={formatCurrency(stats?.averageJobValue || 0)}
              subtitle="Per job"
              icon="📊"
              color="#9c27b0"
              trend={{ value: 3.1, isPositive: false }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Key Metrics
          </Text>
          
          <View style={styles.statsGrid}>
            <StatsCard
              title="Clients"
              value={stats?.totalClients || 0}
              subtitle="Total active"
              icon="👥"
              color="#607d8b"
              onPress={() => navigation.navigate('Clients' as never)}
            />
            <StatsCard
              title="Workers"
              value={stats?.totalWorkers || 0}
              subtitle="Team members"
              icon="🔨"
              color="#795548"
              onPress={() => navigation.navigate('Workers' as never)}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              title="Completion Rate"
              value="91%"
              subtitle="Last 30 days"
              icon="✅"
              color="#4caf50"
              trend={{ value: 2.3, isPositive: true }}
            />
            <StatsCard
              title="Customer Rating"
              value="4.8★"
              subtitle="Average rating"
              icon="⭐"
              color="#ffc107"
              trend={{ value: 0.2, isPositive: true }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
});