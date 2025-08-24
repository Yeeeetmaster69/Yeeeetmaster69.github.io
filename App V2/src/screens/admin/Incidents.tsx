import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  FAB, 
  Portal,
  Modal,
  Button,
  TextInput,
  Surface,
  Card,
  IconButton,
  Menu,
  Chip,
  SegmentedButtons,
  Searchbar
} from 'react-native-paper';
import { 
  getIncidentReports, 
  createIncidentReport, 
  updateIncidentReport,
  investigateIncident,
  resolveIncident
} from '../../services/safety';
import { IncidentReport, IncidentType, IncidentSeverity } from '../../utils/types';

export default function AdminIncidents({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'other' as IncidentType,
    severity: 'medium' as IncidentSeverity,
    title: '',
    description: '',
    location: '',
    injuredParties: '',
    witnessInfo: '',
    propertyDamage: '',
    equipmentInvolved: '',
    actionsTaken: '',
    followUpRequired: false,
    followUpNotes: ''
  });

  const [menuVisible, setMenuVisible] = useState<{[key: string]: boolean}>({});

  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'reported', label: 'Reported' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const incidentTypes = [
    { value: 'injury', label: 'Injury' },
    { value: 'property_damage', label: 'Property Damage' },
    { value: 'equipment_failure', label: 'Equipment Failure' },
    { value: 'safety_violation', label: 'Safety Violation' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [searchQuery, filterSeverity, filterStatus, incidents]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await getIncidentReports();
      setIncidents(data);
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = incidents;

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(incident => incident.severity === filterSeverity);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(incident => incident.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredIncidents(filtered);
  };

  const resetForm = () => {
    setFormData({
      type: 'other',
      severity: 'medium',
      title: '',
      description: '',
      location: '',
      injuredParties: '',
      witnessInfo: '',
      propertyDamage: '',
      equipmentInvolved: '',
      actionsTaken: '',
      followUpRequired: false,
      followUpNotes: ''
    });
  };

  const handleCreate = async () => {
    try {
      const injuredPartiesArray = formData.injuredParties ? 
        formData.injuredParties.split(',').map(s => s.trim()).filter(s => s) : [];
      
      await createIncidentReport({
        reporterId: 'admin-user', // Replace with actual user ID
        reporterRole: 'admin',
        type: formData.type,
        severity: formData.severity,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        injuredParties: injuredPartiesArray.length > 0 ? injuredPartiesArray : undefined,
        witnessInfo: formData.witnessInfo || undefined,
        propertyDamage: formData.propertyDamage || undefined,
        equipmentInvolved: formData.equipmentInvolved || undefined,
        actionsTaken: formData.actionsTaken,
        followUpRequired: formData.followUpRequired,
        followUpNotes: formData.followUpNotes || undefined,
        reportedAt: Date.now()
      });

      setCreateModalVisible(false);
      resetForm();
      loadIncidents();
    } catch (error) {
      console.error('Error creating incident report:', error);
      Alert.alert('Error', 'Failed to create incident report');
    }
  };

  const handleInvestigate = async (incidentId: string) => {
    try {
      await investigateIncident(incidentId, 'admin-user'); // Replace with actual user ID
      loadIncidents();
    } catch (error) {
      console.error('Error investigating incident:', error);
    }
  };

  const handleResolve = async (incidentId: string) => {
    Alert.prompt(
      'Resolve Incident',
      'Please provide resolution notes:',
      async (text) => {
        if (text) {
          try {
            await resolveIncident(incidentId, text);
            loadIncidents();
          } catch (error) {
            console.error('Error resolving incident:', error);
          }
        }
      }
    );
  };

  const openMenu = (incidentId: string) => {
    setMenuVisible(prev => ({ ...prev, [incidentId]: true }));
  };

  const closeMenu = (incidentId: string) => {
    setMenuVisible(prev => ({ ...prev, [incidentId]: false }));
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'critical': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return '#2196f3';
      case 'investigating': return '#ff9800';
      case 'resolved': return '#4caf50';
      case 'closed': return '#757575';
      default: return '#757575';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderIncidentCard = (incident: IncidentReport) => (
    <Card key={incident.id} style={styles.incidentCard}>
      <Card.Content>
        <View style={styles.incidentHeader}>
          <View style={styles.incidentInfo}>
            <Text variant="titleMedium" style={styles.incidentTitle}>{incident.title}</Text>
            <Text variant="bodyMedium" style={styles.incidentLocation}>{incident.location}</Text>
            <Text variant="bodySmall" style={styles.incidentDate}>
              {formatDate(incident.reportedAt)} at {formatTime(incident.reportedAt)}
            </Text>
          </View>
          <Menu
            visible={menuVisible[incident.id!] || false}
            onDismiss={() => closeMenu(incident.id!)}
            anchor={
              <IconButton 
                icon="dots-vertical" 
                onPress={() => openMenu(incident.id!)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                closeMenu(incident.id!);
                setSelectedIncident(incident);
                setDetailModalVisible(true);
              }} 
              title="View Details" 
              leadingIcon="eye"
            />
            {incident.status === 'reported' && (
              <Menu.Item 
                onPress={() => {
                  closeMenu(incident.id!);
                  handleInvestigate(incident.id!);
                }} 
                title="Start Investigation" 
                leadingIcon="magnify"
              />
            )}
            {incident.status === 'investigating' && (
              <Menu.Item 
                onPress={() => {
                  closeMenu(incident.id!);
                  handleResolve(incident.id!);
                }} 
                title="Mark Resolved" 
                leadingIcon="check"
              />
            )}
          </Menu>
        </View>

        <View style={styles.incidentDetails}>
          <View style={styles.detailRow}>
            <Chip 
              icon="alert" 
              mode="outlined" 
              compact
              style={[
                styles.detailChip,
                { backgroundColor: getSeverityColor(incident.severity) + '20' }
              ]}
            >
              {incident.severity.toUpperCase()}
            </Chip>
            <Chip 
              icon="clipboard-text" 
              mode="outlined" 
              compact
              style={styles.detailChip}
            >
              {incident.type.replace('_', ' ').toUpperCase()}
            </Chip>
            <Chip 
              icon="circle" 
              mode="outlined" 
              compact
              style={[
                styles.detailChip,
                { backgroundColor: getStatusColor(incident.status) + '20' }
              ]}
            >
              {incident.status.toUpperCase()}
            </Chip>
          </View>

          <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
            {incident.description}
          </Text>

          {incident.followUpRequired && (
            <Chip 
              icon="alert-circle" 
              mode="outlined" 
              compact
              style={[styles.followUpChip, { backgroundColor: '#ff9800' + '20' }]}
            >
              Follow-up Required
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search incidents..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filters}>
          <SegmentedButtons
            value={filterSeverity}
            onValueChange={setFilterSeverity}
            buttons={severityOptions.slice(0, 3)}
            style={styles.segmentedButtons}
          />
          <SegmentedButtons
            value={filterStatus}
            onValueChange={setFilterStatus}
            buttons={statusOptions.slice(0, 3)}
            style={styles.segmentedButtons}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Incident Reports
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {filteredIncidents.length} incident(s) found
          </Text>
        </View>

        {filteredIncidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No incidents found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Create an incident report if something needs to be documented
            </Text>
          </View>
        ) : (
          filteredIncidents.map(renderIncidentCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
      />

      {/* Create Incident Modal */}
      <Portal>
        <Modal 
          visible={createModalVisible} 
          onDismiss={() => setCreateModalVisible(false)} 
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="headlineSmall" style={styles.modalTitle}>Create Incident Report</Text>

            <Text variant="labelMedium" style={styles.inputLabel}>Incident Type</Text>
            <SegmentedButtons
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as IncidentType }))}
              buttons={incidentTypes.slice(0, 3)}
              style={styles.input}
            />
            <SegmentedButtons
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as IncidentType }))}
              buttons={incidentTypes.slice(3)}
              style={styles.input}
            />

            <Text variant="labelMedium" style={styles.inputLabel}>Severity Level</Text>
            <SegmentedButtons
              value={formData.severity}
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as IncidentSeverity }))}
              buttons={severityLevels}
              style={styles.input}
            />

            <TextInput
              label="Incident Title"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <TextInput
              label="Location"
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Actions Taken"
              value={formData.actionsTaken}
              onChangeText={(text) => setFormData(prev => ({ ...prev, actionsTaken: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Injured Parties (comma-separated)"
              value={formData.injuredParties}
              onChangeText={(text) => setFormData(prev => ({ ...prev, injuredParties: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Witness Information"
              value={formData.witnessInfo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, witnessInfo: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Property Damage"
              value={formData.propertyDamage}
              onChangeText={(text) => setFormData(prev => ({ ...prev, propertyDamage: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Equipment Involved"
              value={formData.equipmentInvolved}
              onChangeText={(text) => setFormData(prev => ({ ...prev, equipmentInvolved: text }))}
              style={styles.input}
              mode="outlined"
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setCreateModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreate}
                style={styles.modalButton}
                disabled={!formData.title || !formData.description || !formData.location}
              >
                Create Report
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Detail Modal */}
      <Portal>
        <Modal 
          visible={detailModalVisible} 
          onDismiss={() => setDetailModalVisible(false)} 
          contentContainerStyle={styles.modal}
        >
          {selectedIncident && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                {selectedIncident.title}
              </Text>

              <View style={styles.detailSection}>
                <Text variant="labelLarge" style={styles.detailLabel}>Status</Text>
                <Chip 
                  icon="circle" 
                  style={[
                    styles.detailValue,
                    { backgroundColor: getStatusColor(selectedIncident.status) + '20' }
                  ]}
                >
                  {selectedIncident.status.toUpperCase()}
                </Chip>
              </View>

              <View style={styles.detailSection}>
                <Text variant="labelLarge" style={styles.detailLabel}>Type & Severity</Text>
                <View style={styles.detailRow}>
                  <Chip style={styles.detailValue}>{selectedIncident.type.replace('_', ' ')}</Chip>
                  <Chip 
                    style={[
                      styles.detailValue,
                      { backgroundColor: getSeverityColor(selectedIncident.severity) + '20' }
                    ]}
                  >
                    {selectedIncident.severity.toUpperCase()}
                  </Chip>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text variant="labelLarge" style={styles.detailLabel}>Description</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {selectedIncident.description}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text variant="labelLarge" style={styles.detailLabel}>Location</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {selectedIncident.location}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text variant="labelLarge" style={styles.detailLabel}>Actions Taken</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {selectedIncident.actionsTaken}
                </Text>
              </View>

              {selectedIncident.followUpRequired && (
                <View style={styles.detailSection}>
                  <Text variant="labelLarge" style={styles.detailLabel}>Follow-up Notes</Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {selectedIncident.followUpNotes || 'No notes provided'}
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.modalButton}
                >
                  Close
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
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
    backgroundColor: 'white',
    padding: 16,
    gap: 12,
  },
  searchbar: {
    backgroundColor: '#f0f0f0',
  },
  filters: {
    gap: 8,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  incidentCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  incidentLocation: {
    color: '#666',
    marginTop: 4,
  },
  incidentDate: {
    color: '#999',
    marginTop: 2,
  },
  incidentDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  detailChip: {
    backgroundColor: '#f5f5f5',
  },
  description: {
    color: '#666',
  },
  followUpChip: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    marginBottom: 8,
    color: '#666',
  },
  detailValue: {
    marginBottom: 4,
  },
});