import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip, Avatar } from 'react-native-paper';
import { Job, JobStatus } from '../utils/types';

interface JobCardProps {
  job: Job;
  onPress?: () => void;
  onStatusChange?: (status: JobStatus) => void;
  showActions?: boolean;
  compact?: boolean;
}

const statusColors = {
  pending: '#ff9800',
  active: '#4caf50',
  upcoming: '#2196f3',
  completed: '#9e9e9e',
  cancelled: '#f44336'
};

export default function JobCard({ job, onPress, onStatusChange, showActions = false, compact = false }: JobCardProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not scheduled';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0.00';
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>{job.title}</Text>
            <Chip 
              mode="outlined" 
              style={[styles.statusChip, { borderColor: statusColors[job.status || 'pending'] }]}
              textStyle={{ color: statusColors[job.status || 'pending'] }}
            >
              {job.status || 'pending'}
            </Chip>
          </View>
          {job.priority && (
            <Chip 
              mode="flat" 
              style={[styles.priorityChip, { backgroundColor: job.priority === 'urgent' ? '#ffebee' : '#f3e5f5' }]}
              textStyle={{ color: job.priority === 'urgent' ? '#d32f2f' : '#7b1fa2' }}
            >
              {job.priority}
            </Chip>
          )}
        </View>

        {!compact && (
          <>
            <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
              {job.description}
            </Text>
            
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.label}>Address:</Text>
                <Text variant="bodySmall" numberOfLines={1} style={styles.value}>{job.address}</Text>
              </View>
              
              {job.scheduledAt && (
                <View style={styles.detailRow}>
                  <Text variant="bodySmall" style={styles.label}>Scheduled:</Text>
                  <Text variant="bodySmall" style={styles.value}>{formatDate(job.scheduledAt)}</Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text variant="bodySmall" style={styles.label}>Rate:</Text>
                <Text variant="bodySmall" style={styles.value}>
                  {job.priceType === 'fixed' ? formatCurrency(job.fixedPrice) : `${formatCurrency(job.hourlyRate)}/hr`}
                </Text>
              </View>

              {job.totalCost && (
                <View style={styles.detailRow}>
                  <Text variant="bodySmall" style={styles.label}>Total:</Text>
                  <Text variant="bodySmall" style={[styles.value, styles.totalCost]}>{formatCurrency(job.totalCost)}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {showActions && (
          <View style={styles.actions}>
            <Button mode="outlined" compact onPress={() => onStatusChange?.('active')}>
              Start
            </Button>
            <Button mode="outlined" compact onPress={() => onStatusChange?.('completed')}>
              Complete
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  statusChip: {
    height: 24,
  },
  priorityChip: {
    height: 24,
    marginLeft: 8,
  },
  description: {
    marginBottom: 12,
    color: '#666',
  },
  details: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
    color: '#888',
    minWidth: 80,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
  totalCost: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
});