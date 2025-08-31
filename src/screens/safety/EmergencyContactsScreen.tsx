// Safety & Compliance: Emergency Contacts Management
// Placeholder implementation for worker emergency contacts setup

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph,
  List,
  IconButton,
  Switch,
  HelperText,
  FAB
} from 'react-native-paper';
import EmergencyService from '../../services/emergency';

interface EmergencyContact {
  id?: string;
  userId: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  email?: string;
  isPrimary: boolean;
  notificationMethods: ('sms' | 'call' | 'email' | 'push')[];
  isActive: boolean;
}

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phoneNumber: '',
    relationship: '',
    email: '',
    isPrimary: false,
    notificationMethods: ['sms', 'call']
  });

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      // TODO: Load emergency contacts from Firestore
      // Query emergency_contacts collection for current user
      
      // Mock data for placeholder
      setContacts([
        {
          id: '1',
          userId: 'current-user-id',
          name: 'Jane Smith',
          phoneNumber: '+1-555-0123',
          relationship: 'Spouse',
          email: 'jane@example.com',
          isPrimary: true,
          notificationMethods: ['sms', 'call', 'email'],
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(newContact.phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      const contact: Omit<EmergencyContact, 'id'> = {
        userId: 'current-user-id', // TODO: Get from auth context
        name: newContact.name!,
        phoneNumber: newContact.phoneNumber!,
        relationship: newContact.relationship || 'Other',
        email: newContact.email,
        isPrimary: newContact.isPrimary || false,
        notificationMethods: newContact.notificationMethods || ['sms', 'call'],
        isActive: true
      };

      const contactId = await EmergencyService.addEmergencyContact(contact);
      
      // Add to local state with the generated ID
      setContacts([...contacts, { ...contact, id: contactId }]);
      
      // Reset form
      setNewContact({
        name: '',
        phoneNumber: '',
        relationship: '',
        email: '',
        isPrimary: false,
        notificationMethods: ['sms', 'call']
      });
      setIsAddingContact(false);
      
      Alert.alert('Success', 'Emergency contact added successfully');
      
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      Alert.alert('Error', 'Failed to add emergency contact');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Remove from Firestore
              setContacts(contacts.filter(c => c.id !== contactId));
            } catch (error) {
              console.error('Error removing contact:', error);
            }
          }
        }
      ]
    );
  };

  const handleTestSOS = async () => {
    Alert.alert(
      'Test Emergency System',
      'This will send a test notification to your emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Test', 
          onPress: async () => {
            try {
              const success = await EmergencyService.testEmergencySystem('current-user-id'); // TODO: Get from auth context
              if (success) {
                Alert.alert('Test Sent', 'Test notifications sent to emergency contacts');
              } else {
                Alert.alert('Test Failed', 'Failed to send test notifications');
              }
            } catch (error) {
              console.error('Error testing emergency system:', error);
              Alert.alert('Error', 'Failed to test emergency system');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Emergency Contacts</Title>
          <Paragraph>
            Set up emergency contacts who will be notified if you activate the SOS feature. 
            At least one contact is required for emergency response.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Emergency Contact List */}
      {contacts.map((contact) => (
        <Card key={contact.id} style={styles.card}>
          <Card.Content>
            <View style={styles.contactHeader}>
              <View style={styles.contactInfo}>
                <Title style={styles.contactName}>{contact.name}</Title>
                <Paragraph>{contact.relationship}</Paragraph>
                <Paragraph>{contact.phoneNumber}</Paragraph>
                {contact.email && <Paragraph>{contact.email}</Paragraph>}
                {contact.isPrimary && (
                  <Paragraph style={styles.primaryLabel}>Primary Contact</Paragraph>
                )}
              </View>
              <IconButton
                icon="delete"
                iconColor="#d32f2f"
                onPress={() => contact.id && handleRemoveContact(contact.id)}
              />
            </View>
            <View style={styles.notificationMethods}>
              <Paragraph style={styles.notificationLabel}>Notification Methods:</Paragraph>
              <Paragraph>{contact.notificationMethods.join(', ')}</Paragraph>
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Add New Contact Form */}
      {isAddingContact && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Add Emergency Contact</Title>
            
            <TextInput
              label="Full Name *"
              value={newContact.name || ''}
              onChangeText={(text) => setNewContact({...newContact, name: text})}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Phone Number *"
              value={newContact.phoneNumber || ''}
              onChangeText={(text) => setNewContact({...newContact, phoneNumber: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="+1-555-0123"
            />

            <TextInput
              label="Relationship"
              value={newContact.relationship || ''}
              onChangeText={(text) => setNewContact({...newContact, relationship: text})}
              mode="outlined"
              style={styles.input}
              placeholder="Spouse, Family, Friend, etc."
            />

            <TextInput
              label="Email (Optional)"
              value={newContact.email || ''}
              onChangeText={(text) => setNewContact({...newContact, email: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
            />

            <View style={styles.switchContainer}>
              <Paragraph>Primary Contact</Paragraph>
              <Switch
                value={newContact.isPrimary || false}
                onValueChange={(value) => setNewContact({...newContact, isPrimary: value})}
              />
            </View>
            <HelperText type="info">
              Primary contact will be notified first in emergencies
            </HelperText>

            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={() => setIsAddingContact(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleAddContact}
                style={styles.addButton}
              >
                Add Contact
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Add Contact Button */}
      {!isAddingContact && (
        <Button
          mode="outlined"
          onPress={() => setIsAddingContact(true)}
          style={styles.addContactButton}
        >
          Add Emergency Contact
        </Button>
      )}

      {/* Test SOS Button */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Test Emergency System</Title>
          <Paragraph>
            Send a test notification to verify your emergency contacts can receive alerts.
          </Paragraph>
          <Button
            mode="outlined"
            onPress={handleTestSOS}
            style={styles.testButton}
            disabled={contacts.length === 0}
          >
            Send Test Alert
          </Button>
        </Card.Content>
      </Card>

      {/* SOS Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>How Emergency SOS Works</Title>
          <List.Item
            title="Immediate Response"
            description="SOS button sends your location and emergency alert to all contacts"
            left={() => <List.Icon icon="map-marker" />}
          />
          <List.Item
            title="Progressive Escalation"
            description="If no response received, alerts escalate to supervisors and emergency services"
            left={() => <List.Icon icon="clock-outline" />}
          />
          <List.Item
            title="Location Tracking"
            description="Your location is shared in real-time during active emergencies"
            left={() => <List.Icon icon="crosshairs-gps" />}
          />
        </Card.Content>
      </Card>

      {/* Emergency SOS FAB */}
      <FAB
        style={styles.sosButton}
        icon="phone-alert"
        label="Emergency SOS"
        onPress={async () => {
          Alert.alert(
            'Activate Emergency SOS',
            'This will immediately notify your emergency contacts. Continue?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Activate SOS', 
                style: 'destructive',
                onPress: async () => {
                  try {
                    await EmergencyService.activateSOS('current-user-id', 'worker'); // TODO: Get from auth context
                    Alert.alert('SOS Activated', 'Emergency contacts have been notified');
                  } catch (error) {
                    console.error('SOS activation failed:', error);
                    Alert.alert('Error', 'Failed to activate SOS. Please call emergency services directly.');
                  }
                }
              }
            ]
          );
        }}
        color="#ffffff"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    marginBottom: 4,
  },
  primaryLabel: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationMethods: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  notificationLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
  },
  addContactButton: {
    margin: 16,
  },
  testButton: {
    marginTop: 8,
  },
  sosButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#d32f2f',
  },
});