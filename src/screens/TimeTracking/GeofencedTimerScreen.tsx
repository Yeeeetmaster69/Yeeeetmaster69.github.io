import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  FAB,
  Portal,
  Dialog,
  Surface,
  ProgressBar,
  Chip
} from 'react-native-paper';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/env';
import SkeletonLoader from '../../components/SkeletonLoader';

const { width } = Dimensions.get('window');

interface JobLocation {
  latitude: number;
  longitude: number;
  address: string;
  radius: number; // meters
}

interface TimeEntry {
  id: string;
  jobId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  startLocation: Location.LocationObject;
  endLocation?: Location.LocationObject;
  isWithinGeofence: boolean;
  notes?: string;
}

interface ActiveJob {
  id: string;
  title: string;
  clientName: string;
  location: JobLocation;
  estimatedDuration: number; // minutes
  hourlyRate: number;
}

export default function GeofencedTimerScreen() {
  const { user } = useAuth();
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mock job data - replace with actual data from Firestore
  const availableJobs: ActiveJob[] = [
    {
      id: '1',
      title: 'Kitchen Faucet Repair',
      clientName: 'John Smith',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St, New York, NY',
        radius: 100
      },
      estimatedDuration: 120,
      hourlyRate: 50
    },
    {
      id: '2',
      title: 'Bathroom Tile Work',
      clientName: 'Sarah Johnson',
      location: {
        latitude: 40.7589,
        longitude: -73.9851,
        address: '456 Park Ave, New York, NY',
        radius: 150
      },
      estimatedDuration: 240,
      hourlyRate: 60
    }
  ];

  useEffect(() => {
    initializeLocation();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentLocation && activeJob) {
      checkGeofence();
    }
  }, [currentLocation, activeJob]);

  useEffect(() => {
    if (currentTimeEntry) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [currentTimeEntry]);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for time tracking');
        return;
      }

      // Start watching location
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          setCurrentLocation(location);
        }
      );

      // Get initial location
      const location = await Location.getCurrentPositionAsync();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error initializing location:', error);
      Alert.alert('Error', 'Failed to initialize location services');
    } finally {
      setLoading(false);
    }
  };

  const checkGeofence = () => {
    if (!currentLocation || !activeJob) return;

    const distance = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      activeJob.location.latitude,
      activeJob.location.longitude
    );

    const withinGeofence = distance <= activeJob.location.radius;
    setIsWithinGeofence(withinGeofence);

    // Auto-stop timer if worker moves too far from job site
    if (currentTimeEntry && !withinGeofence) {
      Alert.alert(
        'Left Job Site',
        'You have moved outside the job site area. Would you like to pause the timer?',
        [
          { text: 'Continue', style: 'cancel' },
          { text: 'Pause', onPress: pauseTimer }
        ]
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const pauseTimer = () => {
    stopTimer();
    // In a real app, you'd save the current state
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartJob = (job: ActiveJob) => {
    if (!currentLocation) {
      Alert.alert('Location Required', 'Please enable location services to start timing');
      return;
    }

    const distance = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      job.location.latitude,
      job.location.longitude
    );

    if (distance > job.location.radius) {
      Alert.alert(
        'Not at Job Site',
        `You are ${Math.round(distance)}m away from the job site. You need to be within ${job.location.radius}m to start timing.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const timeEntry: TimeEntry = {
      id: Date.now().toString(),
      jobId: job.id,
      startTime: new Date(),
      duration: 0,
      startLocation: currentLocation,
      isWithinGeofence: true,
    };

    setActiveJob(job);
    setCurrentTimeEntry(timeEntry);
    setTimer(0);
    setShowJobDialog(false);

    Alert.alert('Timer Started', `Started timing for ${job.title}`);
  };

  const handleStopJob = () => {
    if (!currentTimeEntry || !currentLocation) return;

    Alert.alert(
      'Stop Timer',
      'Are you sure you want to stop the timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          onPress: () => {
            const updatedTimeEntry: TimeEntry = {
              ...currentTimeEntry,
              endTime: new Date(),
              duration: timer,
              endLocation: currentLocation,
            };

            // Save time entry to database
            console.log('Saving time entry:', updatedTimeEntry);

            setCurrentTimeEntry(null);
            setActiveJob(null);
            setTimer(0);

            Alert.alert('Timer Stopped', 'Time entry has been saved');
          }
        }
      ]
    );
  };

  const estimatedEarnings = activeJob ? (timer / 3600) * activeJob.hourlyRate : 0;
  const progressPercentage = activeJob ? Math.min((timer / 60) / activeJob.estimatedDuration, 1) : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SkeletonLoader width="60%" height={24} />
          <SkeletonLoader width="100%" height={120} style={styles.timerSkeleton} />
        </View>
        <View style={styles.content}>
          <SkeletonLoader width="100%" height={200} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Time Tracking</Text>
        
        {activeJob && (
          <Surface style={styles.activeJobCard} elevation={2}>
            <View style={styles.jobHeader}>
              <View style={styles.jobInfo}>
                <Text variant="titleMedium" style={styles.jobTitle}>
                  {activeJob.title}
                </Text>
                <Text variant="bodySmall" style={styles.clientName}>
                  {activeJob.clientName}
                </Text>
                <Text variant="bodySmall" style={styles.jobAddress}>
                  {activeJob.location.address}
                </Text>
              </View>
              <Chip 
                icon={isWithinGeofence ? "check-circle" : "alert-circle"}
                style={[
                  styles.geofenceChip,
                  { backgroundColor: isWithinGeofence ? '#4caf50' : '#ff9800' }
                ]}
                textStyle={styles.chipText}
              >
                {isWithinGeofence ? 'In Range' : 'Out of Range'}
              </Chip>
            </View>
            
            <Text variant="displayLarge" style={styles.timer}>
              {formatTime(timer)}
            </Text>
            
            <ProgressBar 
              progress={progressPercentage} 
              style={styles.progressBar}
            />
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text variant="bodySmall" style={styles.statLabel}>Estimated</Text>
                <Text variant="titleMedium">${estimatedEarnings.toFixed(2)}</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="bodySmall" style={styles.statLabel}>Rate</Text>
                <Text variant="titleMedium">${activeJob.hourlyRate}/hr</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="bodySmall" style={styles.statLabel}>Progress</Text>
                <Text variant="titleMedium">{Math.round(progressPercentage * 100)}%</Text>
              </View>
            </View>
          </Surface>
        )}
      </View>

      <View style={styles.content}>
        {!activeJob ? (
          <View style={styles.noActiveJob}>
            <Text variant="headlineSmall" style={styles.noJobTitle}>
              No Active Timer
            </Text>
            <Text variant="bodyMedium" style={styles.noJobText}>
              Select a job to start timing your work
            </Text>
          </View>
        ) : (
          <View style={styles.controls}>
            <Button
              mode="contained"
              onPress={handleStopJob}
              icon="stop"
              style={styles.stopButton}
              buttonColor="#f44336"
            >
              Stop Timer
            </Button>
          </View>
        )}
      </View>

      <FAB
        icon={activeJob ? "pause" : "play"}
        style={styles.fab}
        onPress={activeJob ? pauseTimer : () => setShowJobDialog(true)}
        label={activeJob ? "Pause" : "Start Job"}
      />

      <Portal>
        <Dialog visible={showJobDialog} onDismiss={() => setShowJobDialog(false)}>
          <Dialog.Title>Select Job</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Choose a job to start timing:
            </Text>
            {availableJobs.map((job) => (
              <Card key={job.id} style={styles.jobCard} onPress={() => handleStartJob(job)}>
                <Card.Content>
                  <Text variant="titleMedium">{job.title}</Text>
                  <Text variant="bodySmall">{job.clientName}</Text>
                  <Text variant="bodySmall">{job.location.address}</Text>
                  <View style={styles.jobDetails}>
                    <Text variant="bodySmall">
                      Est. {job.estimatedDuration}min • ${job.hourlyRate}/hr
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowJobDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  timerSkeleton: {
    marginBottom: 16,
  },
  activeJobCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientName: {
    color: '#666',
    marginBottom: 2,
  },
  jobAddress: {
    color: '#888',
    fontSize: 12,
  },
  geofenceChip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timer: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2196f3',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    marginBottom: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noActiveJob: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noJobTitle: {
    marginBottom: 8,
    color: '#666',
  },
  noJobText: {
    color: '#888',
    textAlign: 'center',
  },
  controls: {
    marginTop: 32,
  },
  stopButton: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialogText: {
    marginBottom: 16,
  },
  jobCard: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  jobDetails: {
    marginTop: 8,
  },
});