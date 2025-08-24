import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Chip,
  RadioButton,
  Portal,
  Modal,
  Surface
} from 'react-native-paper';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

interface Incident {
  id: string;
  reporterId: string;
  reporterRole: 'worker' | 'client';
  jobId?: string;
  type: 'injury' | 'property_damage' | 'equipment_failure' | 'safety_concern' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  photos: string[];
  documents: string[];
  witnessInfo?: {
    name: string;
    contact: string;
    statement: string;
  };
  immediateActionTaken: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  assignedInvestigator?: string;
  followUpNotes: string[];
  resolutionNotes?: string;
  createdAt: any;
  updatedAt: any;
}

export default function IncidentReporting() {
  const { user, claims } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'safety_concern' as const,
    severity: 'medium' as const,
    title: '',
    description: '',
    location: { address: '' },
    immediateActionTaken: '',
    witnessInfo: { name: '', contact: '', statement: '' }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, [user]);

  const loadIncidents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, 'incidents'),
        where('reporterId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const incidentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      setIncidents(incidentList);
    } catch (error) {
      console.error('Error loading incidents:', error);
      Alert.alert('Error', 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const submitIncident = async () => {
    if (!user || !newIncident.title.trim() || !newIncident.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const incidentData = {
        reporterId: user.uid,
        reporterRole: claims.role || 'client',
        ...newIncident,
        photos: [],
        documents: [],
        followUpNotes: [],
        status: 'reported',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'incidents'), incidentData);
      
      Alert.alert('Success', 'Incident reported successfully');
      setShowReportModal(false);
      resetForm();
      loadIncidents();
    } catch (error) {
      console.error('Error submitting incident:', error);
      Alert.alert('Error', 'Failed to submit incident report');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewIncident({
      type: 'safety_concern',
      severity: 'medium',
      title: '',
      description: '',
      location: { address: '' },
      immediateActionTaken: '',
      witnessInfo: { name: '', contact: '', statement: '' }
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return '#2196f3';
      case 'investigating': return '#ff9800';
      case 'resolved': return '#4caf50';
      case 'closed': return '#9e9e9e';
      default: return '#757575';
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text variant="headlineSmall">Safety Incidents</Text>
        <Button 
          mode="contained" 
          onPress={() => setShowReportModal(true)}
          icon="alert-circle"
          buttonColor="#19a974"
        >
          Report Incident
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {incidents.length === 0 ? (
          <Card style={{ padding: 20, alignItems: 'center' }}>
            <Text variant="bodyLarge" style={{ color: '#666', textAlign: 'center' }}>
              No incidents reported yet
            </Text>
            <Text variant="bodyMedium" style={{ color: '#999', textAlign: 'center', marginTop: 8 }}>
              Use the "Report Incident" button to report safety concerns
            </Text>
          </Card>
        ) : (
          incidents.map((incident) => (
            <Card key={incident.id} style={{ marginBottom: 12 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text variant="titleMedium" style={{ flex: 1 }}>{incident.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Chip 
                      mode="outlined" 
                      textStyle={{ color: getSeverityColor(incident.severity) }}
                      style={{ borderColor: getSeverityColor(incident.severity) }}
                    >
                      {incident.severity.toUpperCase()}
                    </Chip>
                    <Chip 
                      mode="outlined"
                      textStyle={{ color: getStatusColor(incident.status) }}
                      style={{ borderColor: getStatusColor(incident.status) }}
                    >
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </View>
                </View>
                
                <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                  Type: {incident.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                
                <Text variant="bodyMedium" style={{ color: '#666', marginBottom: 8 }}>
                  {incident.description}
                </Text>
                
                {incident.location.address && (
                  <Text variant="bodySmall" style={{ color: '#888' }}>
                    Location: {incident.location.address}
                  </Text>
                )}
                
                <Text variant="bodySmall" style={{ color: '#999', marginTop: 8 }}>
                  Reported: {incident.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal 
          visible={showReportModal} 
          onDismiss={() => setShowReportModal(false)}
          contentContainerStyle={{ margin: 20 }}
        >
          <Surface style={{ padding: 20, borderRadius: 8 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="headlineSmall" style={{ marginBottom: 16 }}>Report Safety Incident</Text>

              <TextInput
                label="Incident Title *"
                value={newIncident.title}
                onChangeText={(text) => setNewIncident({ ...newIncident, title: text })}
                mode="outlined"
                style={{ marginBottom: 12 }}
              />

              <Text variant="labelLarge" style={{ marginBottom: 8 }}>Incident Type</Text>
              <RadioButton.Group
                onValueChange={(value) => setNewIncident({ ...newIncident, type: value as any })}
                value={newIncident.type}
              >
                {['injury', 'property_damage', 'equipment_failure', 'safety_concern', 'other'].map((type) => (
                  <RadioButton.Item
                    key={type}
                    label={type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    value={type}
                  />
                ))}
              </RadioButton.Group>

              <Text variant="labelLarge" style={{ marginBottom: 8, marginTop: 12 }}>Severity Level</Text>
              <RadioButton.Group
                onValueChange={(value) => setNewIncident({ ...newIncident, severity: value as any })}
                value={newIncident.severity}
              >
                {['low', 'medium', 'high', 'critical'].map((severity) => (
                  <RadioButton.Item
                    key={severity}
                    label={severity.toUpperCase()}
                    value={severity}
                  />
                ))}
              </RadioButton.Group>

              <TextInput
                label="Description *"
                value={newIncident.description}
                onChangeText={(text) => setNewIncident({ ...newIncident, description: text })}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={{ marginBottom: 12 }}
              />

              <TextInput
                label="Location Address"
                value={newIncident.location.address}
                onChangeText={(text) => setNewIncident({ 
                  ...newIncident, 
                  location: { ...newIncident.location, address: text }
                })}
                mode="outlined"
                style={{ marginBottom: 12 }}
              />

              <TextInput
                label="Immediate Action Taken"
                value={newIncident.immediateActionTaken}
                onChangeText={(text) => setNewIncident({ ...newIncident, immediateActionTaken: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={{ marginBottom: 12 }}
              />

              <Text variant="labelLarge" style={{ marginBottom: 8 }}>Witness Information (Optional)</Text>
              
              <TextInput
                label="Witness Name"
                value={newIncident.witnessInfo.name}
                onChangeText={(text) => setNewIncident({ 
                  ...newIncident, 
                  witnessInfo: { ...newIncident.witnessInfo, name: text }
                })}
                mode="outlined"
                style={{ marginBottom: 8 }}
              />

              <TextInput
                label="Witness Contact"
                value={newIncident.witnessInfo.contact}
                onChangeText={(text) => setNewIncident({ 
                  ...newIncident, 
                  witnessInfo: { ...newIncident.witnessInfo, contact: text }
                })}
                mode="outlined"
                style={{ marginBottom: 8 }}
              />

              <TextInput
                label="Witness Statement"
                value={newIncident.witnessInfo.statement}
                onChangeText={(text) => setNewIncident({ 
                  ...newIncident, 
                  witnessInfo: { ...newIncident.witnessInfo, statement: text }
                })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={{ marginBottom: 20 }}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowReportModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={submitIncident}
                  loading={loading}
                  disabled={loading}
                  style={{ flex: 1 }}
                  buttonColor="#19a974"
                >
                  Submit Report
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}