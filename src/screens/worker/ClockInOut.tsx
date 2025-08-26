
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Surface,
  Chip,
  IconButton,
  Badge,
  Divider
} from 'react-native-paper';
import { startLocation, stopLocation } from '../../services/location';
import { clockIn, clockOut } from '../../services/timesheets';
import { auth } from '../../config/firebase';
import { Job, TimeEntry } from '../../utils/types';

export default function ClockInOut({ navigation }: any) {
  const [currentSession, setCurrentSession] = useState<TimeEntry | null>(null);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [todayHours, setTodayHours] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    loadCurrentSession();
    loadTodayStats();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentSession) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentSession.startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentSession]);

  const loadCurrentSession = async () => {
    try {
      // Mock data - in real app, this would come from Firebase
      const mockActiveJob: Job = {
        id: '1',
        title: 'Kitchen Faucet Repair',
        description: 'Replace leaky kitchen faucet and check water pressure',
        address: '123 Oak Street, Downtown',
        status: 'active',
        hourlyRate: 65,
        clientId: 'client1'
      };

      // Check if already clocked in (mock check)
      const isCurrentlyClocked = false; // This would be from Firebase

      if (isCurrentlyClocked) {
        const mockSession: TimeEntry = {
          id: 'session1',
          jobId: '1',
          workerId: auth.currentUser!.uid,
          startTime: Date.now() - 3600000, // Started 1 hour ago
          hourlyRate: 65,
          earnings: 0
        };
        setCurrentSession(mockSession);
        setActiveJob(mockActiveJob);
      }
    } catch (error) {
      console.error('Error loading current session:', error);
    }
  };

  const loadTodayStats = async () => {
    try {
      // Mock data - in real app, this would come from Firebase
      setTodayHours(6.5);
      setWeeklyHours(32.5);
      setTodayEarnings(422.50);
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
  };

  const handleClockIn = async () => {
    if (!activeJob) {
      Alert.alert(
        'No Active Job',
        'Please select a job before clocking in. Go to Jobs tab to view available assignments.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View Jobs', onPress: () => navigation.navigate('Jobs') }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      await startLocation();
      setLocationEnabled(true);
      
      const sessionId = await clockIn(activeJob.id!, auth.currentUser!.uid, 0, 0);
      
      const newSession: TimeEntry = {
        id: sessionId,
        jobId: activeJob.id!,
        workerId: auth.currentUser!.uid,
        startTime: Date.now(),
        hourlyRate: activeJob.hourlyRate || 0,
        earnings: 0
      };
      
      setCurrentSession(newSession);
      Alert.alert('Success', 'You have been clocked in with GPS tracking enabled.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentSession) return;

    Alert.alert(
      'Clock Out',
      `Are you sure you want to clock out? You've worked ${formatDuration(elapsedTime)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clock Out', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const meters = await stopLocation();
              setLocationEnabled(false);
              
              await clockOut(currentSession.id!, 0, 0, meters);
              
              const sessionHours = elapsedTime / 3600;
              const sessionEarnings = sessionHours * currentSession.hourlyRate;
              
              setTodayHours(prev => prev + sessionHours);
              setTodayEarnings(prev => prev + sessionEarnings);
              
              Alert.alert(
                'Clocked Out Successfully',
                `Session: ${formatDuration(elapsedTime)}\nEarnings: $${sessionEarnings.toFixed(2)}\nDistance: ${(meters / 1609.34).toFixed(2)} miles`,
                [{ text: 'OK' }]
              );
              
              setCurrentSession(null);
              setElapsedTime(0);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to clock out');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getCurrentEarnings = () => {
    if (!currentSession) return 0;
    const sessionHours = elapsedTime / 3600;
    return sessionHours * currentSession.hourlyRate;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Time Tracking
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {currentSession ? 'Currently clocked in' : 'Ready to start work'}
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Current Session Card */}
        <Card style={[styles.sessionCard, currentSession && styles.activeSessionCard]} elevation={3}>
          <Card.Content>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text variant="titleLarge" style={styles.sessionTitle}>
                  {currentSession ? 'Active Session' : 'Ready to Clock In'}
                </Text>
                <View style={styles.statusRow}>
                  <Chip 
                    mode="flat" 
                    style={[
                      styles.statusChip, 
                      { backgroundColor: currentSession ? '#4caf50' : '#ff9800' + '20' }
                    ]}
                    textStyle={{ color: currentSession ? 'white' : '#ff9800' }}
                  >
                    {currentSession ? 'WORKING' : 'READY'}
                  </Chip>
                  {locationEnabled && (
                    <Chip mode="flat" style={styles.gpsChip} textStyle={{ color: 'white' }}>
                      📍 GPS Active
                    </Chip>
                  )}
                </View>
              </View>
              <IconButton 
                icon={currentSession ? "stop" : "play"} 
                size={32}
                iconColor={currentSession ? '#f44336' : '#4caf50'}
                style={styles.sessionIcon}
              />
            </View>

            {currentSession && (
              <>
                <Divider style={styles.divider} />
                
                <View style={styles.timerSection}>
                  <Text variant="headlineLarge" style={styles.timerText}>
                    {formatDuration(elapsedTime)}
                  </Text>
                  <Text variant="bodyMedium" style={styles.timerSubtext}>
                    Session earnings: {formatCurrency(getCurrentEarnings())}
                  </Text>
                </View>

                {activeJob && (
                  <>
                    <Divider style={styles.divider} />
                    
                    <View style={styles.jobSection}>
                      <Text variant="titleMedium" style={styles.jobTitle}>
                        Current Job
                      </Text>
                      <Text variant="titleSmall" style={styles.jobName}>
                        {activeJob.title}
                      </Text>
                      <Text variant="bodyMedium" style={styles.jobAddress}>
                        📍 {activeJob.address}
                      </Text>
                      <Text variant="bodyMedium" style={styles.jobRate}>
                        💰 {formatCurrency(activeJob.hourlyRate || 0)}/hour
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}

            <View style={styles.sessionActions}>
              {!currentSession ? (
                <Button 
                  mode="contained" 
                  onPress={handleClockIn}
                  loading={loading}
                  style={styles.clockInButton}
                  icon="play"
                >
                  Clock In with GPS
                </Button>
              ) : (
                <Button 
                  mode="contained" 
                  onPress={handleClockOut}
                  loading={loading}
                  style={styles.clockOutButton}
                  icon="stop"
                >
                  Clock Out
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Today's Summary */}
        <View style={styles.summarySection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Today's Summary
          </Text>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text variant="headlineMedium" style={[styles.statValue, { color: '#2196f3' }]}>
                  {todayHours.toFixed(1)}h
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Hours Worked
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text variant="headlineMedium" style={[styles.statValue, { color: '#4caf50' }]}>
                  {formatCurrency(todayEarnings)}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Earnings
                </Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.weeklyCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.weeklyTitle}>
                Weekly Progress
              </Text>
              <Text variant="bodyLarge" style={styles.weeklyHours}>
                {weeklyHours.toFixed(1)} / 40 hours
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min((weeklyHours / 40) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text variant="bodySmall" style={styles.progressText}>
                {(40 - weeklyHours).toFixed(1)} hours remaining this week
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          
          <View style={styles.actionButtons}>
            <Button 
              mode="outlined" 
              icon="briefcase"
              onPress={() => navigation.navigate('Jobs')}
              style={styles.actionButton}
            >
              View Jobs
            </Button>
            <Button 
              mode="outlined" 
              icon="chart-line"
              onPress={() => navigation.navigate('Earnings')}
              style={styles.actionButton}
            >
              View Earnings
            </Button>
            <Button 
              mode="outlined" 
              icon="map-marker-distance"
              onPress={() => navigation.navigate('Miles')}
              style={styles.actionButton}
            >
              Track Miles
            </Button>
            <Button 
              mode="outlined" 
              icon="phone"
              onPress={() => navigation.navigate('EmergencyContact')}
              style={styles.actionButton}
            >
              Emergency
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
  sessionCard: {
    backgroundColor: 'white',
    marginBottom: 24,
  },
  activeSessionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  gpsChip: {
    height: 28,
    backgroundColor: '#4caf50',
  },
  sessionIcon: {
    margin: 0,
    backgroundColor: '#f5f5f5',
  },
  divider: {
    marginVertical: 16,
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timerText: {
    fontWeight: '700',
    color: '#2196f3',
    marginBottom: 8,
  },
  timerSubtext: {
    color: '#666',
  },
  jobSection: {
    marginVertical: 16,
  },
  jobTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  jobName: {
    fontWeight: '600',
    color: '#2196f3',
    marginBottom: 4,
  },
  jobAddress: {
    color: '#666',
    marginBottom: 4,
  },
  jobRate: {
    color: '#666',
  },
  sessionActions: {
    marginTop: 16,
  },
  clockInButton: {
    backgroundColor: '#4caf50',
  },
  clockOutButton: {
    backgroundColor: '#f44336',
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
  weeklyCard: {
    backgroundColor: 'white',
  },
  weeklyTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  weeklyHours: {
    fontWeight: '600',
    color: '#2196f3',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  progressText: {
    color: '#666',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});
