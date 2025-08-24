import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Linking } from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  List, 
  FAB,
  Portal,
  Modal,
  Surface,
  IconButton,
  Chip
} from 'react-native-paper';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';

interface EmergencyContact {
  id: string;
  workerId: string;
  name: string;
  phone: string;
  email: string;
  relationship: 'supervisor' | 'family' | 'medical' | 'police' | 'fire' | 'other';
  isPrimary: boolean;
  isActive: boolean;
  responseTime?: number;
}

interface EmergencyAlert {
  id: string;
  workerId: string;
  jobId?: string;
  type: 'sos' | 'medical' | 'safety' | 'check_in_overdue';
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracy: number;
  };
  status: 'active' | 'responded' | 'resolved' | 'false_alarm';
  contactsNotified: string[];
  responseTime?: number;
  resolutionNotes?: string;
  createdAt: any;
  resolvedAt?: any;
}

export default function EmergencyContact() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [emergencyInProgress, setEmergencyInProgress] = useState(false);

  useEffect(() => {
    if (user?.role === 'worker') {
      loadEmergencyContacts();
      loadActiveAlerts();
      getCurrentLocation();
    }
  }, [user]);

  const loadEmergencyContacts = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'emergency_contacts'),
        where('workerId', '==', user.uid),
        where('isActive', '==', true),
        orderBy('isPrimary', 'desc')
      );
      const snapshot = await getDocs(q);
      const contactList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyContact[];
      setContacts(contactList);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const loadActiveAlerts = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'emergency_alerts'),
        where('workerId', '==', user.uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const alertList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyAlert[];
      setActiveAlerts(alertList);
      setEmergencyInProgress(alertList.length > 0);
    } catch (error) {
      console.error('Error loading active alerts:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required for emergency services');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const activateSOS = async (type: 'sos' | 'medical' | 'safety') => {
    if (!user || !location) {
      Alert.alert('Error', 'Unable to get current location for emergency alert');
      return;
    }

    try {
      setLoading(true);
      
      // Get address from coordinates (simplified - would use reverse geocoding in production)
      const address = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
      
      const alertData = {
        workerId: user.uid,
        type,
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          address,
          accuracy: location.coords.accuracy || 0
        },
        status: 'active',
        contactsNotified: contacts.map(c => c.id),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'emergency_alerts'), alertData);
      
      // Simulate contacting emergency services
      if (contacts.length > 0) {
        Alert.alert(
          'Emergency Alert Activated',
          `Emergency contacts have been notified. Emergency services will be contacted if needed.\n\nLocation: ${address}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Emergency Alert Activated',
          'No emergency contacts configured. Please set up emergency contacts in your profile.',
          [{ text: 'OK' }]
        );
      }

      setShowSOSModal(false);
      loadActiveAlerts();
    } catch (error) {
      console.error('Error activating SOS:', error);
      Alert.alert('Error', 'Failed to activate emergency alert');
    } finally {
      setLoading(false);
    }
  };

  const callContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const call911 = () => {
    Alert.alert(
      'Call Emergency Services',
      'This will call 911. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', onPress: () => Linking.openURL('tel:911') }
      ]
    );
  };

  if (user?.role !== 'worker') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 16 }}>
          Emergency Features
        </Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', color: '#666' }}>
          Emergency contact features are only available for workers.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
          Emergency & Safety
        </Text>

        {emergencyInProgress && (
          <Card style={{ backgroundColor: '#ffebee', marginBottom: 16 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton icon="alert" iconColor="#d32f2f" size={24} />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ color: '#d32f2f' }}>
                    Emergency Alert Active
                  </Text>
                  <Text variant="bodyMedium">
                    Your emergency contacts have been notified
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Emergency Actions */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 12 }}>Quick Emergency Actions</Text>
            
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <Button 
                mode="contained" 
                onPress={call911}
                buttonColor="#d32f2f"
                style={{ flex: 1 }}
                icon="phone"
              >
                Call 911
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => setShowSOSModal(true)}
                style={{ flex: 1 }}
                icon="alert-circle"
              >
                SOS Alert
              </Button>
            </View>

            <Text variant="bodySmall" style={{ color: '#666' }}>
              Use Call 911 for immediate emergencies. SOS Alert notifies your emergency contacts.
            </Text>
          </Card.Content>
        </Card>

        {/* Emergency Contacts */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="titleLarge">Emergency Contacts</Text>
              <Button 
                mode="outlined" 
                onPress={() => Alert.alert('Info', 'Contact your administrator to update emergency contacts')}
                icon="account-plus"
              >
                Manage
              </Button>
            </View>

            {contacts.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Text variant="bodyLarge" style={{ color: '#666', textAlign: 'center' }}>
                  No emergency contacts configured
                </Text>
                <Text variant="bodyMedium" style={{ color: '#999', textAlign: 'center', marginTop: 8 }}>
                  Contact your administrator to set up emergency contacts
                </Text>
              </View>
            ) : (
              contacts.map((contact) => (
                <List.Item
                  key={contact.id}
                  title={contact.name}
                  description={`${contact.relationship} • ${contact.phone}`}
                  left={(props) => <List.Icon {...props} icon="account-circle" />}
                  right={() => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {contact.isPrimary && (
                        <Chip mode="outlined" compact style={{ marginRight: 8 }}>
                          Primary
                        </Chip>
                      )}
                      <IconButton
                        icon="phone"
                        size={20}
                        onPress={() => callContact(contact.phone)}
                      />
                    </View>
                  )}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Location Status */}
        <Card>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 12 }}>Current Location</Text>
            {location ? (
              <View>
                <Text variant="bodyMedium">
                  Latitude: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text variant="bodyMedium">
                  Longitude: {location.coords.longitude.toFixed(6)}
                </Text>
                <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
                  Accuracy: ±{location.coords.accuracy?.toFixed(0) || 'Unknown'} meters
                </Text>
              </View>
            ) : (
              <View>
                <Text variant="bodyMedium" style={{ color: '#666' }}>
                  Location not available
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={getCurrentLocation}
                  style={{ marginTop: 8 }}
                  icon="crosshairs-gps"
                >
                  Get Current Location
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Emergency SOS Modal */}
      <Portal>
        <Modal 
          visible={showSOSModal} 
          onDismiss={() => setShowSOSModal(false)}
          contentContainerStyle={{ margin: 20 }}
        >
          <Surface style={{ padding: 20, borderRadius: 8 }}>
            <Text variant="headlineSmall" style={{ marginBottom: 16, textAlign: 'center' }}>
              Emergency Alert
            </Text>
            
            <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 20 }}>
              What type of emergency assistance do you need?
            </Text>

            <View style={{ gap: 12 }}>
              <Button 
                mode="contained" 
                onPress={() => activateSOS('medical')}
                loading={loading}
                disabled={loading}
                buttonColor="#d32f2f"
                icon="medical-bag"
              >
                Medical Emergency
              </Button>
              
              <Button 
                mode="contained" 
                onPress={() => activateSOS('safety')}
                loading={loading}
                disabled={loading}
                buttonColor="#f57c00"
                icon="shield-alert"
              >
                Safety Concern
              </Button>
              
              <Button 
                mode="contained" 
                onPress={() => activateSOS('sos')}
                loading={loading}
                disabled={loading}
                buttonColor="#1976d2"
                icon="help-circle"
              >
                General SOS
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={() => setShowSOSModal(false)}
                style={{ marginTop: 8 }}
              >
                Cancel
              </Button>
            </View>

            <Text variant="bodySmall" style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>
              Your emergency contacts will be immediately notified with your current location.
            </Text>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}