import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  List, 
  Chip,
  DataTable,
  Searchbar,
  Portal,
  Modal,
  Surface,
  RadioButton,
  Checkbox,
  Divider
} from 'react-native-paper';
import { collection, addDoc, query, orderBy, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface BackgroundCheck {
  id: string;
  workerId: string;
  workerName?: string;
  type: 'initial' | 'periodic' | 'incident_triggered';
  provider: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  requestedAt: any;
  completedAt?: any;
  expiresAt?: any;
  consent: {
    given: boolean;
    givenAt: any;
    ipAddress: string;
  };
  checks: {
    criminal: 'clear' | 'review' | 'disqualifying' | 'pending';
    driving: 'clear' | 'review' | 'disqualifying' | 'pending' | 'not_required';
    identity: 'verified' | 'failed' | 'pending';
    references: 'clear' | 'review' | 'pending' | 'not_required';
  };
  notes: string[];
  reviewedBy?: string;
  reviewedAt?: any;
  nextCheckDue?: any;
}

interface Worker {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: string;
}

export default function BackgroundChecks() {
  const { user } = useAuth();
  const [backgroundChecks, setBackgroundChecks] = useState<BackgroundCheck[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCheckModal, setShowNewCheckModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [checkType, setCheckType] = useState<'initial' | 'periodic' | 'incident_triggered'>('initial');
  const [provider, setProvider] = useState('checkr');
  const [requiredChecks, setRequiredChecks] = useState({
    criminal: true,
    driving: false,
    identity: true,
    references: false
  });
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadBackgroundChecks();
      loadWorkers();
    }
  }, [user]);

  const loadBackgroundChecks = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'background_checks'),
        orderBy('requestedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const checks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BackgroundCheck[];
      
      setBackgroundChecks(checks);
    } catch (error) {
      console.error('Error loading background checks:', error);
      Alert.alert('Error', 'Failed to load background checks');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'worker')
      );
      const snapshot = await getDocs(q);
      const workerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Worker[];
      
      setWorkers(workerList);
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const initiateBackgroundCheck = async () => {
    if (!selectedWorker) {
      Alert.alert('Error', 'Please select a worker');
      return;
    }

    try {
      setLoading(true);
      
      const worker = workers.find(w => w.id === selectedWorker);
      const checkData = {
        workerId: selectedWorker,
        workerName: worker ? `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || worker.email : 'Unknown',
        type: checkType,
        provider,
        status: 'pending',
        requestedAt: new Date(),
        consent: {
          given: false,
          givenAt: null,
          ipAddress: ''
        },
        checks: {
          criminal: requiredChecks.criminal ? 'pending' : 'not_required',
          driving: requiredChecks.driving ? 'pending' : 'not_required',
          identity: requiredChecks.identity ? 'pending' : 'not_required',
          references: requiredChecks.references ? 'pending' : 'not_required'
        },
        notes: [`Background check initiated by ${user?.email || 'admin'}`],
        nextCheckDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      };

      await addDoc(collection(db, 'background_checks'), checkData);
      
      Alert.alert('Success', 'Background check initiated successfully');
      setShowNewCheckModal(false);
      resetForm();
      loadBackgroundChecks();
    } catch (error) {
      console.error('Error initiating background check:', error);
      Alert.alert('Error', 'Failed to initiate background check');
    } finally {
      setLoading(false);
    }
  };

  const updateCheckStatus = async (checkId: string, status: string) => {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === 'completed') {
        updateData.completedAt = new Date();
        updateData.reviewedBy = user?.email || 'admin';
        updateData.reviewedAt = new Date();
      }

      await updateDoc(doc(db, 'background_checks', checkId), updateData);
      loadBackgroundChecks();
    } catch (error) {
      console.error('Error updating check status:', error);
      Alert.alert('Error', 'Failed to update check status');
    }
  };

  const resetForm = () => {
    setSelectedWorker('');
    setCheckType('initial');
    setProvider('checkr');
    setRequiredChecks({
      criminal: true,
      driving: false,
      identity: true,
      references: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in_progress': return '#ff9800';
      case 'pending': return '#2196f3';
      case 'failed': return '#f44336';
      case 'expired': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getCheckResultColor = (result: string) => {
    switch (result) {
      case 'clear': case 'verified': return '#4caf50';
      case 'review': return '#ff9800';
      case 'disqualifying': case 'failed': return '#f44336';
      case 'pending': return '#2196f3';
      case 'not_required': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const filteredChecks = backgroundChecks.filter(check => {
    const matchesSearch = !searchQuery || 
      check.workerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.workerId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || check.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (user?.role !== 'admin') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 16 }}>
          Background Checks
        </Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', color: '#666' }}>
          Background check management is only available for administrators.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text variant="headlineSmall">Background Checks</Text>
        <Button 
          mode="contained" 
          onPress={() => setShowNewCheckModal(true)}
          icon="account-check"
        >
          New Check
        </Button>
      </View>

      <Searchbar
        placeholder="Search workers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {['all', 'pending', 'in_progress', 'completed', 'failed'].map((status) => (
          <Chip
            key={status}
            selected={filterStatus === status}
            onPress={() => setFilterStatus(status)}
            mode={filterStatus === status ? 'flat' : 'outlined'}
          >
            {status.replace('_', ' ').toUpperCase()}
          </Chip>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredChecks.length === 0 ? (
          <Card style={{ padding: 20, alignItems: 'center' }}>
            <Text variant="bodyLarge" style={{ color: '#666', textAlign: 'center' }}>
              No background checks found
            </Text>
            <Text variant="bodyMedium" style={{ color: '#999', textAlign: 'center', marginTop: 8 }}>
              Use the "New Check" button to initiate a background check
            </Text>
          </Card>
        ) : (
          filteredChecks.map((check) => (
            <Card key={check.id} style={{ marginBottom: 12 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{check.workerName || 'Unknown Worker'}</Text>
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      {check.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {check.provider}
                    </Text>
                  </View>
                  <Chip 
                    mode="outlined"
                    textStyle={{ color: getStatusColor(check.status) }}
                    style={{ borderColor: getStatusColor(check.status) }}
                  >
                    {check.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {Object.entries(check.checks).map(([checkType, result]) => (
                    <Chip
                      key={checkType}
                      mode="outlined"
                      compact
                      textStyle={{ color: getCheckResultColor(result) }}
                      style={{ borderColor: getCheckResultColor(result) }}
                    >
                      {checkType}: {result.replace('_', ' ')}
                    </Chip>
                  ))}
                </View>

                <Text variant="bodySmall" style={{ color: '#888' }}>
                  Requested: {check.requestedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                </Text>

                {check.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <Button 
                      mode="outlined" 
                      onPress={() => updateCheckStatus(check.id, 'in_progress')}
                      compact
                    >
                      Start
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => updateCheckStatus(check.id, 'completed')}
                      compact
                    >
                      Complete
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal 
          visible={showNewCheckModal} 
          onDismiss={() => setShowNewCheckModal(false)}
          contentContainerStyle={{ margin: 20 }}
        >
          <Surface style={{ padding: 20, borderRadius: 8 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
                Initiate Background Check
              </Text>

              <Text variant="labelLarge" style={{ marginBottom: 8 }}>Select Worker</Text>
              <RadioButton.Group
                onValueChange={setSelectedWorker}
                value={selectedWorker}
              >
                {workers.map((worker) => (
                  <RadioButton.Item
                    key={worker.id}
                    label={`${worker.firstName || ''} ${worker.lastName || ''}`.trim() || worker.email}
                    value={worker.id}
                  />
                ))}
              </RadioButton.Group>

              <Divider style={{ marginVertical: 16 }} />

              <Text variant="labelLarge" style={{ marginBottom: 8 }}>Check Type</Text>
              <RadioButton.Group
                onValueChange={(value) => setCheckType(value as any)}
                value={checkType}
              >
                <RadioButton.Item label="Initial Onboarding" value="initial" />
                <RadioButton.Item label="Periodic Renewal" value="periodic" />
                <RadioButton.Item label="Incident Triggered" value="incident_triggered" />
              </RadioButton.Group>

              <Divider style={{ marginVertical: 16 }} />

              <Text variant="labelLarge" style={{ marginBottom: 8 }}>Provider</Text>
              <RadioButton.Group
                onValueChange={setProvider}
                value={provider}
              >
                <RadioButton.Item label="Checkr" value="checkr" />
                <RadioButton.Item label="Sterling" value="sterling" />
                <RadioButton.Item label="GoodHire" value="goodhire" />
              </RadioButton.Group>

              <Divider style={{ marginVertical: 16 }} />

              <Text variant="labelLarge" style={{ marginBottom: 8 }}>Required Checks</Text>
              
              <Checkbox.Item
                label="Criminal Background Check"
                status={requiredChecks.criminal ? 'checked' : 'unchecked'}
                onPress={() => setRequiredChecks({
                  ...requiredChecks,
                  criminal: !requiredChecks.criminal
                })}
              />
              
              <Checkbox.Item
                label="Driving Record Check"
                status={requiredChecks.driving ? 'checked' : 'unchecked'}
                onPress={() => setRequiredChecks({
                  ...requiredChecks,
                  driving: !requiredChecks.driving
                })}
              />
              
              <Checkbox.Item
                label="Identity Verification"
                status={requiredChecks.identity ? 'checked' : 'unchecked'}
                onPress={() => setRequiredChecks({
                  ...requiredChecks,
                  identity: !requiredChecks.identity
                })}
              />
              
              <Checkbox.Item
                label="Reference Check"
                status={requiredChecks.references ? 'checked' : 'unchecked'}
                onPress={() => setRequiredChecks({
                  ...requiredChecks,
                  references: !requiredChecks.references
                })}
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowNewCheckModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={initiateBackgroundCheck}
                  loading={loading}
                  disabled={loading || !selectedWorker}
                  style={{ flex: 1 }}
                >
                  Initiate Check
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}