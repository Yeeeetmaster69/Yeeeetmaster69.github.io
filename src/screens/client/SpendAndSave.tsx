
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  SegmentedButtons, 
  Surface, 
  Card
} from 'react-native-paper';
import StatsCard from '../../components/StatsCard';

export default function SpendAndSave({ navigation }: any) {
  const [timeFrame, setTimeFrame] = useState('month');

  const timeFrameOptions = [
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Spending Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track your service expenses and savings
        </Text>
      </Surface>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Spending Summary
          </Text>
          
          <SegmentedButtons
            value={timeFrame}
            onValueChange={setTimeFrame}
            buttons={timeFrameOptions}
            style={styles.segmentedButtons}
          />

          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Spent"
              value={formatCurrency(150)}
              subtitle={`${timeFrame} period`}
              icon="💳"
              color="#1976d2"
            />
            <StatsCard
              title="Jobs Completed"
              value={1}
              subtitle={`${timeFrame} period`}
              icon="✅"
              color="#388e3c"
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
    color: '#1a1a1a',
    marginBottom: 16,
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
