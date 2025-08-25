
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
  IconButton,
  Badge
} from 'react-native-paper';
import StatsCard from '../../components/StatsCard';
import { Job, TimeEntry } from '../../utils/types';

export default function WorkerHome({ navigation }: any) {
  const [stats, setStats] = useState({
    todayHours: 0,
    weeklyHours: 28.5,
    todayEarnings: 0,
    weeklyEarnings: 1852.50,
    activeJobs: 3,
    completedJobs: 47,
    totalMiles: 1247.8,
    rating: 4.9
  });
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isClocked, setIsClocked] = useState(false);
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkerData();
  }, []);

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockCurrentJob: Job = {
        id: '1',
        title: 'Kitchen Faucet Repair',
        description: 'Replace leaky kitchen faucet and check water pressure',
        address: '123 Oak Street, Downtown',
        status: 'active',
        hourlyRate: 65,
        scheduledAt: Date.now(),
        clientId: 'client1'
      };

      const mockUpcoming: Job[] = [
        {
          id: '2',
          title: 'Bathroom Tile Repair',
          description: 'Fix cracked tiles in master bathroom',
          address: '456 Pine Ave',
          status: 'upcoming',
          hourlyRate: 70,
          scheduledAt: Date.now() + 3600000 * 2,
          clientId: 'client2'
        },
        {
          id: '3',
          title: 'Deck Staining',
          description: 'Clean and stain wooden deck',
          address: '789 Maple Dr',
          status: 'upcoming',
          hourlyRate: 60,
          scheduledAt: Date.now() + 3600000 * 24,
          clientId: 'client3'
        }
      ];

      setCurrentJob(mockCurrentJob);
      setUpcomingJobs(mockUpcoming);
      setStats(prev => ({
        ...prev,
        todayHours: 6.5,
        todayEarnings: 422.50
      }));
    } catch (error) {
      console.error('Error loading worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (hours: number) => `${hours.toFixed(1)}h`;

  const quickActions = [
    {
      title: isClocked ? 'Clock Out' : 'Clock In',
      icon: isClocked ? 'clock-out' : 'clock-in',
      color: isClocked ? '#f44336' : '#4caf50',
      onPress: () => {
        setIsClocked(!isClocked);
        navigation.navigate('ClockInOut');
      }
    },
    {
      title: 'View Jobs',
      icon: 'briefcase',
      color: '#2196f3',
      onPress: () => navigation.navigate('Jobs')
    },
    {
      title: 'Add Photos',
      icon: 'camera',
      color: '#ff9800',
      onPress: () => navigation.navigate('Photos')
    },
    {
      title: 'Track Miles',
      icon: 'map-marker-distance',
      color: '#9c27b0',
      onPress: () => navigation.navigate('Miles')
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineMedium" style={styles.title}>
              Good Morning, Worker!
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {isClocked ? '🟢 Currently clocked in' : '🔴 Not clocked in'}
            </Text>
          </View>
          <Avatar.Icon size={48} icon="account-hard-hat" style={styles.avatar} />
        </View>
      </Surface>

      <View style={styles.content}>
        {/* Today's Stats */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Today's Performance
          </Text>
          
          <View style={styles.statsGrid}>
            <StatsCard
              title="Hours Worked"
              value={formatTime(stats.todayHours)}
              subtitle="Today"
              icon="🕐"
              color="#4caf50"
              trend={{ value: 12.3, isPositive: true }}
            />
            <StatsCard
              title="Earnings"
              value={formatCurrency(stats.todayEarnings)}
              subtitle="Today"
              icon="💰"
              color="#2196f3"
              trend={{ value: 15.7, isPositive: true }}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              title="Weekly Hours"
              value={formatTime(stats.weeklyHours)}
              subtitle="This week"
              icon="📅"
              color="#ff9800"
            />
            <StatsCard
              title="Rating"
              value={`${stats.rating}⭐`}
              subtitle="Customer rating"
              icon="⭐"
              color="#ffc107"
              trend={{ value: 0.1, isPositive: true }}
            />
          </View>
        </View>

        {/* Current Job */}
        {currentJob && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Current Assignment
            </Text>
            
            <Card style={styles.jobCard} elevation={3}>
              <Card.Content>
                <View style={styles.jobHeader}>
                  <View style={styles.jobInfo}>
                    <Text variant="titleMedium" style={styles.jobTitle}>
                      {currentJob.title}
                    </Text>
                    <Text variant="bodyMedium" style={styles.jobAddress}>
                      📍 {currentJob.address}
                    </Text>
                  </View>
                  <Chip mode="flat" style={styles.statusChip}>
                    {isClocked ? 'In Progress' : 'Ready to Start'}
                  </Chip>
                </View>
                
                <Text variant="bodyMedium" style={styles.jobDescription}>
                  {currentJob.description}
                </Text>
                
                <View style={styles.jobActions}>
                  <Button 
                    mode={isClocked ? "outlined" : "contained"} 
                    onPress={() => navigation.navigate('JobDetail', { job: currentJob })}
                    style={styles.actionButton}
                  >
                    View Details
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={() => navigation.navigate('ClockInOut')}
                    style={styles.actionButton}
                  >
                    {isClocked ? 'Clock Out' : 'Start Job'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Card key={index} style={styles.actionCard} onPress={action.onPress}>
                <Card.Content style={styles.actionContent}>
                  <IconButton 
                    icon={action.icon} 
                    size={32} 
                    iconColor={action.color}
                    style={styles.actionIcon}
                  />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    {action.title}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Upcoming Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Upcoming Jobs
            </Text>
            <Badge size={24} style={styles.badge}>{upcomingJobs.length}</Badge>
          </View>
          
          {upcomingJobs.slice(0, 2).map((job) => (
            <Card key={job.id} style={styles.upcomingJobCard} onPress={() => navigation.navigate('JobDetail', { job })}>
              <Card.Content style={styles.upcomingJobContent}>
                <View style={styles.upcomingJobInfo}>
                  <Text variant="titleSmall" style={styles.upcomingJobTitle}>
                    {job.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.upcomingJobAddress}>
                    📍 {job.address}
                  </Text>
                  <Text variant="bodySmall" style={styles.upcomingJobTime}>
                    🕐 {new Date(job.scheduledAt || 0).toLocaleDateString()} at {new Date(job.scheduledAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.upcomingJobRate}>
                  {formatCurrency(job.hourlyRate || 0)}/hr
                </Text>
              </Card.Content>
            </Card>
          ))}
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Jobs')}
            style={styles.viewAllButton}
          >
            View All Jobs ({upcomingJobs.length})
          </Button>
        </View>

        {/* Additional Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            More Actions
          </Text>
          
          <View style={styles.additionalActions}>
            <Button 
              mode="outlined" 
              icon="chart-line"
              onPress={() => navigation.navigate('Earnings')}
              style={styles.additionalButton}
            >
              View Earnings Report
            </Button>
            <Button 
              mode="outlined" 
              icon="phone"
              onPress={() => navigation.navigate('EmergencyContact')}
              style={styles.additionalButton}
            >
              Emergency Contact
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: '#2196f3',
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
  },
  badge: {
    backgroundColor: '#2196f3',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  jobCard: {
    backgroundColor: 'white',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  jobAddress: {
    color: '#666',
    marginBottom: 4,
  },
  jobDescription: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  statusChip: {
    backgroundColor: '#e3f2fd',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    margin: 0,
  },
  actionText: {
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  upcomingJobCard: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  upcomingJobContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingJobInfo: {
    flex: 1,
  },
  upcomingJobTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  upcomingJobAddress: {
    color: '#666',
    fontSize: 12,
    marginBottom: 2,
  },
  upcomingJobTime: {
    color: '#666',
    fontSize: 12,
  },
  upcomingJobRate: {
    fontWeight: '600',
    color: '#2196f3',
  },
  viewAllButton: {
    marginTop: 8,
  },
  additionalActions: {
    gap: 12,
  },
  additionalButton: {
    marginBottom: 8,
  },
});
