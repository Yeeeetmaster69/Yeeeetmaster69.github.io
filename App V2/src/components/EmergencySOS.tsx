import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Surface, IconButton, Portal, Modal, TextInput } from 'react-native-paper';
import * as Location from 'expo-location';
import { triggerEmergencySOS } from '../../services/safety';

interface EmergencySOSProps {
  userId: string;
  isVisible?: boolean;
  style?: any;
}

export default function EmergencySOS({ userId, isVisible = true, style }: EmergencySOSProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosNotes, setSosNotes] = useState('');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isEmergencyActive) {
      handleEmergencyTrigger();
    }
    return () => clearInterval(interval);
  }, [countdown, isEmergencyActive]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location permission is required for emergency services');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get current location');
    }
  };

  const startEmergencyCountdown = () => {
    Alert.alert(
      'Emergency SOS',
      'This will alert emergency contacts and your supervisor. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setCountdown(5); // 5 second countdown
            setIsEmergencyActive(true);
            setSosModalVisible(true);
          }
        }
      ]
    );
  };

  const cancelEmergency = () => {
    setCountdown(0);
    setIsEmergencyActive(false);
    setSosModalVisible(false);
    setSosNotes('');
  };

  const handleEmergencyTrigger = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Current location is required for emergency services');
      return;
    }

    try {
      await triggerEmergencySOS(userId, location, sosNotes);
      
      setIsEmergencyActive(false);
      setSosModalVisible(false);
      setSosNotes('');
      
      Alert.alert(
        'Emergency SOS Sent',
        'Your emergency alert has been sent to emergency contacts and supervisors. Help is on the way.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error triggering SOS:', error);
      Alert.alert('Error', 'Failed to send emergency alert. Please call 911 directly.');
      setIsEmergencyActive(false);
      setSosModalVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Surface style={styles.sosContainer} elevation={3}>
        <View style={styles.sosHeader}>
          <Text variant="titleMedium" style={styles.sosTitle}>Emergency SOS</Text>
          <Text variant="bodySmall" style={styles.sosSubtitle}>
            Tap to alert emergency contacts
          </Text>
        </View>
        
        <IconButton
          icon="shield-alert"
          iconColor="#fff"
          size={40}
          style={styles.sosButton}
          onPress={startEmergencyCountdown}
        />
      </Surface>

      <Portal>
        <Modal
          visible={sosModalVisible}
          onDismiss={cancelEmergency}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalContent}>
            {countdown > 0 ? (
              <>
                <Text variant="headlineLarge" style={styles.countdownText}>
                  {countdown}
                </Text>
                <Text variant="titleMedium" style={styles.countdownLabel}>
                  Emergency SOS in {countdown} seconds
                </Text>
                <Text variant="bodyMedium" style={styles.countdownDescription}>
                  This will alert your emergency contacts and supervisor
                </Text>
                
                <Button
                  mode="contained"
                  onPress={cancelEmergency}
                  style={styles.cancelButton}
                  buttonColor="#f44336"
                >
                  Cancel Emergency
                </Button>
              </>
            ) : (
              <>
                <Text variant="headlineMedium" style={styles.emergencyTitle}>
                  Emergency Alert Details
                </Text>
                
                <TextInput
                  label="Emergency Notes (Optional)"
                  value={sosNotes}
                  onChangeText={setSosNotes}
                  style={styles.notesInput}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Describe the emergency situation..."
                />

                <View style={styles.locationInfo}>
                  <Text variant="labelMedium" style={styles.locationLabel}>
                    Current Location:
                  </Text>
                  <Text variant="bodyMedium" style={styles.locationText}>
                    {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Getting location...'}
                  </Text>
                </View>

                <View style={styles.emergencyActions}>
                  <Button
                    mode="outlined"
                    onPress={cancelEmergency}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleEmergencyTrigger}
                    style={styles.modalButton}
                    buttonColor="#f44336"
                    disabled={!location}
                  >
                    Send SOS
                  </Button>
                </View>

                <Text variant="bodySmall" style={styles.emergencyDisclaimer}>
                  For immediate life-threatening emergencies, call 911 directly
                </Text>
              </>
            )}
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  sosContainer: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  sosHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sosTitle: {
    color: '#fff',
    fontWeight: '700',
  },
  sosSubtitle: {
    color: '#ffcdd2',
    textAlign: 'center',
    marginTop: 4,
  },
  sosButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 50,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalContent: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#f44336',
    marginBottom: 16,
  },
  countdownLabel: {
    color: '#f44336',
    fontWeight: '600',
    marginBottom: 8,
  },
  countdownDescription: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  cancelButton: {
    width: '100%',
  },
  emergencyTitle: {
    color: '#f44336',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  notesInput: {
    width: '100%',
    marginBottom: 16,
  },
  locationInfo: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationLabel: {
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontFamily: 'monospace',
    color: '#333',
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
  },
  emergencyDisclaimer: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});