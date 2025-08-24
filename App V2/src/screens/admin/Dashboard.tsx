
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, SegmentedButtons, Surface } from 'react-native-paper';
import StatsCard from '../../components/StatsCard';
import { DashboardStats } from '../../utils/types';

export default function Dashboard({ navigation }: any) {
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
        <Text variant="headlineMedium" style={styles.title}>
          Admin Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Overview of your business performance
        </Text>
      </Surface>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
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
              onPress={() => navigation.navigate('Income')}
            />
            <StatsCard
              title="Active Jobs"
              value={stats?.activeJobs || 0}
              subtitle="In progress"
              icon="🔧"
              color="#2196f3"
              onPress={() => navigation.navigate('AdminJobs')}
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
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Business Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <StatsCard
              title="Clients"
              value={stats?.totalClients || 0}
              subtitle="Total active"
              icon="👥"
              color="#607d8b"
              onPress={() => navigation.navigate('Clients')}
            />
            <StatsCard
              title="Workers"
              value={stats?.totalWorkers || 0}
              subtitle="Team members"
              icon="🔨"
              color="#795548"
              onPress={() => navigation.navigate('Workers')}
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

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActions}>
            <Button 
              mode="contained" 
              icon="plus"
              onPress={() => navigation.navigate('AdminJobs')}
              style={styles.actionButton}
            >
              Create Job
            </Button>
            <Button 
              mode="outlined" 
              icon="account-plus"
              onPress={() => navigation.navigate('AddClient')}
              style={styles.actionButton}
            >
              Add Client
            </Button>
            <Button 
              mode="outlined" 
              icon="hammer-wrench"
              onPress={() => navigation.navigate('AddWorker')}
              style={styles.actionButton}
            >
              Add Worker
            </Button>
            <Button 
              mode="outlined" 
              icon="bell"
              onPress={() => navigation.navigate('Notifications')}
              style={styles.actionButton}
            >
              Send Alert
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Management
          </Text>
          
          <View style={styles.managementGrid}>
            <Button 
              mode="outlined" 
              icon="account-group"
              onPress={() => navigation.navigate('Users')}
              style={styles.managementButton}
            >
              Manage Users
            </Button>
            <Button 
              mode="outlined" 
              icon="currency-usd"
              onPress={() => navigation.navigate('Pricing')}
              style={styles.managementButton}
            >
              Pricing
            </Button>
            <Button 
              mode="outlined" 
              icon="cash"
              onPress={() => navigation.navigate('Payroll')}
              style={styles.managementButton}
            >
              Payroll
            </Button>
            <Button 
              mode="outlined" 
              icon="file-document"
              onPress={() => navigation.navigate('Estimates')}
              style={styles.managementButton}
            >
              Estimates
            </Button>
            <Button 
              mode="outlined" 
              icon="receipt"
              onPress={() => navigation.navigate('Invoices')}
              style={styles.managementButton}
            >
              Invoices
            </Button>
            <Button 
              mode="outlined" 
              icon="cog"
              onPress={() => navigation.navigate('Settings')}
              style={styles.managementButton}
            >
              Settings
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
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
  quickActions: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  managementButton: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
});
