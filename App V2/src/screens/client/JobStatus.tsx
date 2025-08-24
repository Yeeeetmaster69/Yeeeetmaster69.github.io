
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  SegmentedButtons, 
  Surface, 
  Card,
  Button,
  Chip
} from 'react-native-paper';
import { Job } from '../../utils/types';

export default function JobStatus({ navigation }: any) {
  const [filterStatus, setFilterStatus] = useState('current');
  const [jobs, setJobs] = useState<Job[]>([]);

  const filterOptions = [
    { value: 'current', label: 'Current' },
    { value: 'history', label: 'History' },
  ];

  useEffect(() => {
    loadJobs();
  }, [filterStatus]);

  const loadJobs = async () => {
    try {
      // Mock data
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Kitchen Faucet Repair',
          description: 'Replace leaky kitchen faucet',
          address: '123 Main St',
          status: 'active',
          hourlyRate: 65,
          scheduledAt: Date.now() + 3600000,
          createdAt: Date.now() - 86400000
        }
      ];

      const filteredJobs = mockJobs.filter(job => {
        if (filterStatus === 'current') {
          return ['pending', 'active', 'upcoming'].includes(job.status!);
        } else {
          return ['completed', 'cancelled'].includes(job.status!);
        }
      });

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#ff9800',
      active: '#4caf50',
      upcoming: '#2196f3',
      completed: '#9e9e9e',
      cancelled: '#f44336'
    };
    return colors[status as keyof typeof colors] || '#666';
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Your Jobs
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track the status of all your service requests
        </Text>
        
        <SegmentedButtons
          value={filterStatus}
          onValueChange={setFilterStatus}
          buttons={filterOptions}
          style={styles.segmentedButtons}
        />
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No {filterStatus} jobs found
            </Text>
          </View>
        ) : (
          jobs.map(job => (
            <Card key={job.id} style={styles.jobCard}>
              <Card.Content>
                <View style={styles.jobHeader}>
                  <Text variant="titleMedium" style={styles.jobTitle}>
                    {job.title}
                  </Text>
                  <Chip 
                    mode="flat" 
                    style={[styles.statusChip, { backgroundColor: getStatusColor(job.status!) + '20' }]}
                    textStyle={{ color: getStatusColor(job.status!) }}
                  >
                    {job.status}
                  </Chip>
                </View>

                <Text variant="bodyMedium" style={styles.jobDescription}>
                  {job.description}
                </Text>

                {job.scheduledAt && (
                  <Text variant="bodySmall" style={styles.detailText}>
                    📅 Scheduled: {formatDate(job.scheduledAt)}
                  </Text>
                )}

                <View style={styles.jobActions}>
                  <Button 
                    mode="outlined" 
                    compact
                    onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                  >
                    View Details
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
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
    marginBottom: 16,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  jobCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  jobTitle: {
    flex: 1,
    fontWeight: '600',
  },
  statusChip: {
    height: 28,
  },
  jobDescription: {
    color: '#666',
    marginBottom: 8,
  },
  detailText: {
    color: '#888',
    marginBottom: 8,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
  },
});
