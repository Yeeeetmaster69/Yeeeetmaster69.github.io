import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
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
  getBackgroundChecks, 
  createBackgroundCheck, 
  updateBackgroundCheck,
  completeBackgroundCheck
} from '../../services/safety';
import { getWorkers } from '../../services/workers';
import { BackgroundCheck, Worker } from '../../utils/types';

export default function AdminBackgroundChecks({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [filteredChecks, setFilteredChecks] = useState<BackgroundCheck[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    workerId: '',
    provider: '',
    checkType: 'criminal' as 'criminal' | 'driving' | 'reference' | 'identity' | 'credit',
    cost: 0,
    notes: ''
  });

  const [completionData, setCompletionData] = useState({
    passed: true,
    details: '',
    documentUrl: ''
  });

  const [menuVisible, setMenuVisible] = useState<{[key: string]: boolean}>({});

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'expired', label: 'Expired' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'criminal', label: 'Criminal' },
    { value: 'driving', label: 'Driving' },
    { value: 'reference', label: 'Reference' },
    { value: 'identity', label: 'Identity' },
    { value: 'credit', label: 'Credit' },
  ];

  const checkTypes = [
    { value: 'criminal', label: 'Criminal Background' },
    { value: 'driving', label: 'Driving Record' },
    { value: 'reference', label: 'Reference Check' },
    { value: 'identity', label: 'Identity Verification' },
    { value: 'credit', label: 'Credit Check' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterChecks();
  }, [searchQuery, filterStatus, filterType, checks]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [checksData, workersData] = await Promise.all([
        getBackgroundChecks(),
        getWorkers()
      ]);
      
      setChecks(checksData);
      setWorkers(workersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChecks = () => {
    let filtered = checks;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(check => check.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(check => check.checkType === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(check => {
        const worker = workers.find(w => w.id === check.workerId);
        const workerName = worker ? `${worker.firstName} ${worker.lastName}` : '';
        
        return workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               check.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
               check.checkType.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    setFilteredChecks(filtered);
  };

  const resetForm = () => {
    setFormData({
      workerId: '',
      provider: '',
      checkType: 'criminal',
      cost: 0,
      notes: ''
    });
  };

  const resetCompletionData = () => {
    setCompletionData({
      passed: true,
      details: '',
      documentUrl: ''
    });
  };

  const handleCreate = async () => {
    try {
      await createBackgroundCheck({
        workerId: formData.workerId,
        provider: formData.provider,
        checkType: formData.checkType,
        cost: formData.cost > 0 ? formData.cost : undefined,
        notes: formData.notes || undefined,
        requestedAt: Date.now()
      });

      setCreateModalVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating background check:', error);
    }
  };

  const handleComplete = async () => {
    if (!selectedCheck?.id) return;

    try {
      await completeBackgroundCheck(
        selectedCheck.id,
        completionData.passed,
        completionData.details || undefined,
        completionData.documentUrl || undefined
      );

      setCompleteModalVisible(false);
      setSelectedCheck(null);
      resetCompletionData();
      loadData();
    } catch (error) {
      console.error('Error completing background check:', error);
    }
  };

  const handleStartCheck = async (checkId: string) => {
    try {
      await updateBackgroundCheck(checkId, { status: 'in_progress' });
      loadData();
    } catch (error) {
      console.error('Error starting background check:', error);
    }
  };

  const openMenu = (checkId: string) => {
    setMenuVisible(prev => ({ ...prev, [checkId]: true }));
  };

  const closeMenu = (checkId: string) => {
    setMenuVisible(prev => ({ ...prev, [checkId]: false }));
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown Worker';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'pending': return '#2196f3';
      case 'in_progress': return '#ff9800';
      case 'failed': return '#f44336';
      case 'expired': return '#757575';
      default: return '#757575';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const renderCheckCard = (check: BackgroundCheck) => (
    <Card key={check.id} style={styles.checkCard}>
      <Card.Content>
        <View style={styles.checkHeader}>
          <View style={styles.checkInfo}>
            <Text variant="titleMedium" style={styles.workerName}>
              {getWorkerName(check.workerId)}
            </Text>
            <Text variant="bodyMedium" style={styles.checkType}>
              {check.checkType.replace('_', ' ').toUpperCase()} - {check.provider}
            </Text>
            <Text variant="bodySmall" style={styles.checkDate}>
              Requested: {formatDate(check.requestedAt)}
            </Text>
          </View>
          <Menu
            visible={menuVisible[check.id!] || false}
            onDismiss={() => closeMenu(check.id!)}
            anchor={
              <IconButton 
                icon="dots-vertical" 
                onPress={() => openMenu(check.id!)}
              />
            }
          >
            {check.status === 'pending' && (
              <Menu.Item 
                onPress={() => {
                  closeMenu(check.id!);
                  handleStartCheck(check.id!);
                }} 
                title="Start Check" 
                leadingIcon="play"
              />
            )}
            {check.status === 'in_progress' && (
              <Menu.Item 
                onPress={() => {
                  closeMenu(check.id!);
                  setSelectedCheck(check);
                  setCompleteModalVisible(true);
                }} 
                title="Complete Check" 
                leadingIcon="check"
              />
            )}
          </Menu>
        </View>

        <View style={styles.checkDetails}>
          <View style={styles.detailRow}>
            <Chip 
              icon="circle" 
              mode="outlined" 
              compact
              style={[
                styles.detailChip,
                { backgroundColor: getStatusColor(check.status) + '20' }
              ]}
            >
              {check.status.replace('_', ' ').toUpperCase()}
            </Chip>
            {check.cost && (
              <Chip 
                icon="currency-usd" 
                mode="outlined" 
                compact
                style={styles.detailChip}
              >
                {formatPrice(check.cost)}
              </Chip>
            )}
          </View>

          {check.results && (
            <View style={styles.resultsContainer}>
              <Chip 
                icon={check.results.passed ? "check-circle" : "close-circle"} 
                mode="outlined" 
                compact
                style={[
                  styles.resultChip,
                  { backgroundColor: check.results.passed ? '#4caf50' + '20' : '#f44336' + '20' }
                ]}
              >
                {check.results.passed ? 'PASSED' : 'FAILED'}
              </Chip>
              {check.results.details && (
                <Text variant="bodySmall" style={styles.resultDetails}>
                  {check.results.details}
                </Text>
              )}
            </View>
          )}

          {check.notes && (
            <Text variant="bodySmall" style={styles.notes}>
              Notes: {check.notes}
            </Text>
          )}

          {check.completedAt && (
            <Text variant="bodySmall" style={styles.completedDate}>
              Completed: {formatDate(check.completedAt)}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search by worker or provider..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filters}>
          <SegmentedButtons
            value={filterStatus}
            onValueChange={setFilterStatus}
            buttons={statusOptions.slice(0, 3)}
            style={styles.segmentedButtons}
          />
          <SegmentedButtons
            value={filterType}
            onValueChange={setFilterType}
            buttons={typeOptions.slice(0, 3)}
            style={styles.segmentedButtons}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Background Checks
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {filteredChecks.length} check(s) found
          </Text>
        </View>

        {filteredChecks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No background checks found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Create a background check request to get started
            </Text>
          </View>
        ) : (
          filteredChecks.map(renderCheckCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
      />

      {/* Create Background Check Modal */}
      <Portal>
        <Modal 
          visible={createModalVisible} 
          onDismiss={() => setCreateModalVisible(false)} 
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Request Background Check
            </Text>

            <Text variant="labelMedium" style={styles.inputLabel}>Worker</Text>
            <SegmentedButtons
              value={formData.workerId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, workerId: value }))}
              buttons={workers.slice(0, 4).map(worker => ({
                value: worker.id!,
                label: `${worker.firstName} ${worker.lastName}`.slice(0, 10)
              }))}
              style={styles.input}
            />

            <Text variant="labelMedium" style={styles.inputLabel}>Check Type</Text>
            <SegmentedButtons
              value={formData.checkType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, checkType: value as any }))}
              buttons={checkTypes.slice(0, 3)}
              style={styles.input}
            />
            <SegmentedButtons
              value={formData.checkType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, checkType: value as any }))}
              buttons={checkTypes.slice(3)}
              style={styles.input}
            />

            <TextInput
              label="Provider/Service"
              value={formData.provider}
              onChangeText={(text) => setFormData(prev => ({ ...prev, provider: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Cost ($)"
              value={formData.cost.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, cost: parseFloat(text) || 0 }))}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />

            <TextInput
              label="Notes"
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
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
                disabled={!formData.workerId || !formData.provider}
              >
                Request Check
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Complete Background Check Modal */}
      <Portal>
        <Modal 
          visible={completeModalVisible} 
          onDismiss={() => setCompleteModalVisible(false)} 
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Complete Background Check
            </Text>

            {selectedCheck && (
              <View style={styles.checkSummary}>
                <Text variant="bodyMedium" style={styles.summaryText}>
                  {getWorkerName(selectedCheck.workerId)} - {selectedCheck.checkType.replace('_', ' ')}
                </Text>
                <Text variant="bodySmall" style={styles.summaryProvider}>
                  Provider: {selectedCheck.provider}
                </Text>
              </View>
            )}

            <Text variant="labelMedium" style={styles.inputLabel}>Result</Text>
            <SegmentedButtons
              value={completionData.passed ? 'passed' : 'failed'}
              onValueChange={(value) => setCompletionData(prev => ({ ...prev, passed: value === 'passed' }))}
              buttons={[
                { value: 'passed', label: 'Passed' },
                { value: 'failed', label: 'Failed' }
              ]}
              style={styles.input}
            />

            <TextInput
              label="Details"
              value={completionData.details}
              onChangeText={(text) => setCompletionData(prev => ({ ...prev, details: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Document URL (Optional)"
              value={completionData.documentUrl}
              onChangeText={(text) => setCompletionData(prev => ({ ...prev, documentUrl: text }))}
              style={styles.input}
              mode="outlined"
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setCompleteModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleComplete}
                style={styles.modalButton}
              >
                Complete Check
              </Button>
            </View>
          </ScrollView>
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
  checkCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkInfo: {
    flex: 1,
  },
  workerName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  checkType: {
    color: '#666',
    marginTop: 4,
  },
  checkDate: {
    color: '#999',
    marginTop: 2,
  },
  checkDetails: {
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
  resultsContainer: {
    gap: 8,
  },
  resultChip: {
    alignSelf: 'flex-start',
  },
  resultDetails: {
    color: '#666',
    fontStyle: 'italic',
  },
  notes: {
    color: '#666',
  },
  completedDate: {
    color: '#999',
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
    maxHeight: '80%',
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
  checkSummary: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontWeight: '600',
    color: '#333',
  },
  summaryProvider: {
    color: '#666',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});