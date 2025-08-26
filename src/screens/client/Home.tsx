
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Surface, 
  Avatar,
  Chip,
  Divider,
  IconButton
} from 'react-native-paper';
import { Job } from '../../utils/types';

export default function ClientHome({ navigation }: any) {
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActiveJobs();
  }, []);

  const loadActiveJobs = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Kitchen Faucet Repair',
          description: 'Replace leaky kitchen faucet',
          address: '123 Main St',
          status: 'active',
          workerId: 'worker1',
          scheduledAt: Date.now() + 3600000,
          hourlyRate: 65
        }
      ];
      setActiveJobs(mockJobs);
    } catch (error) {
      console.error('Error loading active jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Request Job',
      description: 'Book a new service',
      icon: 'hammer-wrench',
      color: '#2196f3',
      onPress: () => navigation.navigate('RequestService')
    },
    {
      title: 'Request Estimate',
      description: 'Get a quote',
      icon: 'calculator',
      color: '#4caf50',
      onPress: () => navigation.navigate('ScheduleEstimate')
    },
    {
      title: 'Subscriptions',
      description: 'Manage recurring services',
      icon: 'repeat',
      color: '#673ab7',
      onPress: () => navigation.navigate('Subscriptions')
    },
    {
      title: 'Chat Support',
      description: 'Talk to our team',
      icon: 'chat',
      color: '#ff9800',
      onPress: () => navigation.navigate('Chat')
    },
    {
      title: 'Job List',
      description: 'View all your jobs',
      icon: 'format-list-bulleted',
      color: '#9c27b0',
      onPress: () => navigation.navigate('JobStatus')
    }
  ];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <View style={styles.welcomeSection}>
          <Avatar.Icon size={64} icon="account" style={styles.avatar} />
          <View style={styles.welcomeText}>
            <Text variant="headlineMedium" style={styles.welcomeTitle}>
              Welcome back!
            </Text>
            <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
              Here's what's happening with your services
            </Text>
          </View>
          <IconButton
            icon="bell"
            size={24}
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>
      </Surface>

      <View style={styles.content}>
        {/* Active Jobs Section */}
        {activeJobs.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Active Jobs
            </Text>
            {activeJobs.map(job => (
              <Card key={job.id} style={styles.jobCard}>
                <Card.Content>
                  <View style={styles.jobHeader}>
                    <View style={styles.jobInfo}>
                      <Text variant="titleMedium" style={styles.jobTitle}>
                        {job.title}
                      </Text>
                      <Chip mode="flat" style={styles.statusChip}>
                        {job.status}
                      </Chip>
                    </View>
                  </View>
                  <Text variant="bodyMedium" style={styles.jobDescription}>
                    {job.description}
                  </Text>
                  <Text variant="bodySmall" style={styles.jobSchedule}>
                    📅 Scheduled: {formatDate(job.scheduledAt!)}
                  </Text>
                  <View style={styles.jobActions}>
                    <Button 
                      mode="outlined" 
                      compact
                      onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                    >
                      View Details
                    </Button>
                    <Button 
                      mode="text" 
                      compact
                      onPress={() => navigation.navigate('Chat', { jobId: job.id })}
                    >
                      Message Worker
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Card key={index} style={styles.actionCard} onPress={action.onPress}>
                <Card.Content style={styles.actionContent}>
                  <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                    <IconButton
                      icon={action.icon}
                      size={32}
                      iconColor={action.color}
                    />
                  </View>
                  <Text variant="titleMedium" style={styles.actionTitle}>
                    {action.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.actionDescription}>
                    {action.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Activity
            </Text>
            <Button 
              mode="text" 
              compact
              onPress={() => navigation.navigate('JobStatus')}
            >
              View All
            </Button>
          </View>
          
          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityItem}>
                <View style={styles.activityInfo}>
                  <Text variant="bodyMedium" style={styles.activityTitle}>
                    Kitchen Faucet Repair - Completed
                  </Text>
                  <Text variant="bodySmall" style={styles.activityDate}>
                    Yesterday at 3:30 PM
                  </Text>
                </View>
                <Chip mode="flat" style={styles.completedChip}>
                  Completed
                </Chip>
              </View>
              
              <Divider style={styles.activityDivider} />
              
              <View style={styles.activityItem}>
                <View style={styles.activityInfo}>
                  <Text variant="bodyMedium" style={styles.activityTitle}>
                    Bathroom Tile Estimate - Scheduled
                  </Text>
                  <Text variant="bodySmall" style={styles.activityDate}>
                    2 days ago
                  </Text>
                </View>
                <Chip mode="flat" style={styles.scheduledChip}>
                  Scheduled
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Additional Services Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            More Services
          </Text>
          <View style={styles.servicesGrid}>
            <Button 
              mode="outlined" 
              icon="currency-usd"
              onPress={() => navigation.navigate('SpendAndSave')}
              style={styles.serviceButton}
            >
              Spending
            </Button>
            <Button 
              mode="outlined" 
              icon="star"
              onPress={() => navigation.navigate('Reviews')}
              style={styles.serviceButton}
            >
              Reviews
            </Button>
            <Button 
              mode="outlined" 
              icon="account-group"
              onPress={() => navigation.navigate('Referrals')}
              style={styles.serviceButton}
            >
              References
            </Button>
            <Button 
              mode="outlined" 
              icon="tag"
              onPress={() => navigation.navigate('DealsAndOffers')}
              style={styles.serviceButton}
            >
              Deals
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
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196f3',
    marginRight: 16,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  welcomeSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  jobCard: {
    marginBottom: 12,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobTitle: {
    fontWeight: '600',
    flex: 1,
  },
  statusChip: {
    backgroundColor: '#e3f2fd',
    height: 24,
  },
  jobDescription: {
    color: '#666',
    marginBottom: 8,
  },
  jobSchedule: {
    color: '#888',
    marginBottom: 12,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    elevation: 2,
  },
  actionContent: {
    alignItems: 'center',
    padding: 8,
  },
  actionIcon: {
    borderRadius: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    textAlign: 'center',
    color: '#666',
  },
  activityCard: {
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontWeight: '500',
  },
  activityDate: {
    color: '#666',
    marginTop: 2,
  },
  activityDivider: {
    marginVertical: 12,
  },
  completedChip: {
    backgroundColor: '#e8f5e8',
  },
  scheduledChip: {
    backgroundColor: '#fff3e0',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceButton: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
});
