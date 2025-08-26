import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Chip, ProgressBar } from 'react-native-paper';
import { Worker } from '../utils/types';

interface WorkerCardProps {
  worker: Worker;
  onPress?: () => void;
  compact?: boolean;
  showStats?: boolean;
}

export default function WorkerCard({ worker, onPress, compact = false, showStats = true }: WorkerCardProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#4caf50' : '#f44336';
  };

  const calculateCompletionRate = () => {
    // Mock calculation - in real app, this would be based on actual data
    return Math.min(worker.totalJobs / 100, 1);
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {worker.profileImage ? (
              <Avatar.Image 
                size={compact ? 40 : 56} 
                source={{ uri: worker.profileImage }}
              />
            ) : (
              <Avatar.Text 
                size={compact ? 40 : 56} 
                label={getInitials(worker.firstName, worker.lastName)}
                style={styles.avatar}
              />
            )}
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(worker.isActive) }]} />
          </View>
          
          <View style={styles.info}>
            <Text variant={compact ? "titleMedium" : "titleLarge"} style={styles.name}>
              {worker.firstName} {worker.lastName}
            </Text>
            
            <View style={styles.chips}>
              <Chip 
                mode="outlined" 
                compact
                style={[styles.statusChip, { borderColor: getStatusColor(worker.isActive) }]}
                textStyle={{ color: getStatusColor(worker.isActive) }}
              >
                {worker.isActive ? 'Active' : 'Inactive'}
              </Chip>
              
              <Chip 
                mode="flat" 
                compact
                style={styles.rateChip}
              >
                {formatCurrency(worker.hourlyRate)}/hr
              </Chip>
            </View>
            
            {!compact && (
              <>
                <Text variant="bodySmall" style={styles.contact}>
                  📧 {worker.email}
                </Text>
                <Text variant="bodySmall" style={styles.contact}>
                  📞 {worker.phone}
                </Text>
                
                {worker.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    <Text variant="bodySmall" style={styles.skillsLabel}>Skills:</Text>
                    <View style={styles.skills}>
                      {worker.skills.slice(0, 3).map((skill, index) => (
                        <Chip 
                          key={index}
                          mode="outlined" 
                          compact
                          style={styles.skillChip}
                        >
                          {skill}
                        </Chip>
                      ))}
                      {worker.skills.length > 3 && (
                        <Text variant="bodySmall" style={styles.moreSkills}>
                          +{worker.skills.length - 3} more
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {!compact && showStats && (
          <View style={styles.stats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text variant="titleMedium" style={styles.statValue}>{worker.totalJobs}</Text>
                <Text variant="bodySmall" style={styles.statLabel}>Jobs</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleMedium" style={styles.statValue}>
                  {formatCurrency(worker.totalEarnings)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Earnings</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleMedium" style={styles.statValue}>
                  {worker.totalMilesDriven.toLocaleString()}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Miles</Text>
              </View>
              {worker.averageRating && (
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statValue}>
                    ⭐ {worker.averageRating.toFixed(1)}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>Rating</Text>
                </View>
              )}
            </View>
            
            <View style={styles.progressContainer}>
              <Text variant="bodySmall" style={styles.progressLabel}>
                Completion Rate: {Math.round(calculateCompletionRate() * 100)}%
              </Text>
              <ProgressBar 
                progress={calculateCompletionRate()} 
                color="#4caf50" 
                style={styles.progressBar}
              />
            </View>
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
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    backgroundColor: '#2196f3',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
  },
  rateChip: {
    height: 24,
    backgroundColor: '#e8f5e8',
  },
  contact: {
    color: '#666',
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  skillChip: {
    height: 20,
  },
  moreSkills: {
    color: '#666',
    fontStyle: 'italic',
  },
  stats: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  progressContainer: {
    gap: 4,
  },
  progressLabel: {
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});