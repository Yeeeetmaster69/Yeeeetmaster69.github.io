import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function ClockInOut() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);

  const handleClockInOut = () => {
    if (isClockedIn) {
      // Clock out
      const clockOutTime = new Date();
      const duration = clockOutTime.getTime() - (clockInTime?.getTime() || 0);
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      
      Alert.alert(
        'Clocked Out',
        `Work session: ${hours}h ${minutes}m`,
        [{ text: 'OK' }]
      );
      setIsClockedIn(false);
      setClockInTime(null);
    } else {
      // Clock in
      setIsClockedIn(true);
      setClockInTime(new Date());
      Alert.alert('Clocked In', 'Work session started');
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.clockContainer}>
        <Text style={styles.currentTime}>{getCurrentTime()}</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Current Status:</Text>
        <Text style={[styles.statusText, { color: isClockedIn ? '#4CAF50' : '#f44336' }]}>
          {isClockedIn ? 'Clocked In' : 'Clocked Out'}
        </Text>
        
        {isClockedIn && clockInTime && (
          <Text style={styles.clockInInfo}>
            Started at: {clockInTime.toLocaleTimeString()}
          </Text>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.clockButton, { backgroundColor: isClockedIn ? '#f44336' : '#4CAF50' }]}
        onPress={handleClockInOut}
      >
        <Text style={styles.clockButtonText}>
          {isClockedIn ? 'Clock Out' : 'Clock In'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>GPS Tracking</Text>
        <Text style={styles.infoText}>
          Location services are required for accurate time tracking
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  clockContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  clockInInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  clockButton: {
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 40,
  },
  clockButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});