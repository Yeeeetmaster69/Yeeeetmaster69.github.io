import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Searchbar, 
  SegmentedButtons, 
  Text, 
  FAB,
  Surface,
  Portal,
  Modal,
  Button,
  TextInput,
  Chip
} from 'react-native-paper';
import WorkerCard from '../../components/WorkerCard';
import { Worker } from '../../utils/types';

export default function AdminWorkers({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  // Add worker form state
  const [newWorker, setNewWorker] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    hourlyRate: 50,
    skills: [] as string[],
    isActive: true,
    notes: ''
  });
  const [newSkill, setNewSkill] = useState('');

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    filterWorkers();
  }, [workers, searchQuery, filterStatus]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockWorkers: Worker[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@handyman.com',
          phone: '(555) 123-4567',
          address: '123 Worker St, Springfield, IL',
          hourlyRate: 65,
          skills: ['Plumbing', 'Electrical', 'General Repair'],
          isActive: true,
          totalJobs: 87,
          totalEarnings: 12450,
          totalMilesDriven: 2340,
          averageRating: 4.9,
          hireDate: Date.now() - 86400000 * 365,
          createdAt: Date.now() - 86400000 * 365
        },
        {
          id: '2',
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.garcia@handyman.com',
          phone: '(555) 234-5678',
          address: '456 Builder Ave, Springfield, IL',
          hourlyRate: 70,
          skills: ['Carpentry', 'Flooring', 'Painting'],
          isActive: true,
          totalJobs: 56,
          totalEarnings: 8920,
          totalMilesDriven: 1890,
          averageRating: 4.8,
          hireDate: Date.now() - 86400000 * 180,
          createdAt: Date.now() - 86400000 * 180
        },
        {
          id: '3',
          firstName: 'David',
          lastName: 'Johnson',
          email: 'david.johnson@handyman.com',
          phone: '(555) 345-6789',
          address: '789 Repair Rd, Springfield, IL',
          hourlyRate: 55,
          skills: ['HVAC', 'Appliance Repair'],
          isActive: false,
          totalJobs: 23,
          totalEarnings: 3220,
          totalMilesDriven: 890,
          averageRating: 4.6,
          hireDate: Date.now() - 86400000 * 90,
          createdAt: Date.now() - 86400000 * 90
        }
      ];
      setWorkers(mockWorkers);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkers = () => {
    let filtered = workers;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(worker => 
        filterStatus === 'active' ? worker.isActive : !worker.isActive
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(worker =>
        `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(query) ||
        worker.email.toLowerCase().includes(query) ||
        worker.phone.includes(query) ||
        worker.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    setFilteredWorkers(filtered);
  };

  const handleAddWorker = async () => {
    try {
      const worker: Worker = {
        ...newWorker,
        totalJobs: 0,
        totalEarnings: 0,
        totalMilesDriven: 0,
        hireDate: Date.now(),
        createdAt: Date.now()
      };
      
      setWorkers(prev => [worker, ...prev]);
      setAddModalVisible(false);
      
      // Reset form
      setNewWorker({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        hourlyRate: 50,
        skills: [],
        isActive: true,
        notes: ''
      });
      setNewSkill('');
    } catch (error) {
      console.error('Error adding worker:', error);
    }
  };

  const handleWorkerPress = (worker: Worker) => {
    navigation.navigate('WorkerDetail', { workerId: worker.id });
  };

  const addSkill = () => {
    if (newSkill.trim() && !newWorker.skills.includes(newSkill.trim())) {
      setNewWorker(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setNewWorker(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getWorkerCounts = () => {
    return {
      all: workers.length,
      active: workers.filter(w => w.isActive).length,
      inactive: workers.filter(w => !w.isActive).length,
    };
  };

  const workerCounts = getWorkerCounts();

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Searchbar
          placeholder="Search workers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <SegmentedButtons
          value={filterStatus}
          onValueChange={setFilterStatus}
          buttons={filterOptions.map(option => ({
            ...option,
            label: `${option.label} (${workerCounts[option.value as keyof typeof workerCounts]})`
          }))}
          style={styles.segmentedButtons}
        />
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Workers
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {filteredWorkers.length} {filteredWorkers.length === 1 ? 'worker' : 'workers'}
          </Text>
        </View>

        {filteredWorkers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No workers found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first worker to get started'}
            </Text>
          </View>
        ) : (
          filteredWorkers.map(worker => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onPress={() => handleWorkerPress(worker)}
              showStats={true}
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={addModalVisible}
          onDismiss={() => setAddModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Add New Worker
            </Text>

            <View style={styles.row}>
              <TextInput
                label="First Name"
                value={newWorker.firstName}
                onChangeText={(text) => setNewWorker(prev => ({ ...prev, firstName: text }))}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
              />
              <TextInput
                label="Last Name"
                value={newWorker.lastName}
                onChangeText={(text) => setNewWorker(prev => ({ ...prev, lastName: text }))}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
              />
            </View>

            <TextInput
              label="Email"
              value={newWorker.email}
              onChangeText={(text) => setNewWorker(prev => ({ ...prev, email: text }))}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />

            <TextInput
              label="Phone"
              value={newWorker.phone}
              onChangeText={(text) => setNewWorker(prev => ({ ...prev, phone: text }))}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />

            <TextInput
              label="Address"
              value={newWorker.address}
              onChangeText={(text) => setNewWorker(prev => ({ ...prev, address: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Hourly Rate ($)"
              value={newWorker.hourlyRate.toString()}
              onChangeText={(text) => setNewWorker(prev => ({ ...prev, hourlyRate: parseFloat(text) || 0 }))}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />

            <View style={styles.skillsSection}>
              <Text variant="titleMedium" style={styles.skillsTitle}>Skills</Text>
              
              <View style={styles.skillsInput}>
                <TextInput
                  label="Add Skill"
                  value={newSkill}
                  onChangeText={setNewSkill}
                  style={[styles.input, styles.skillInput]}
                  mode="outlined"
                  onSubmitEditing={addSkill}
                />
                <Button 
                  mode="outlined" 
                  onPress={addSkill}
                  style={styles.addSkillButton}
                  disabled={!newSkill.trim()}
                >
                  Add
                </Button>
              </View>

              <View style={styles.skillsContainer}>
                {newWorker.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    onClose={() => removeSkill(skill)}
                    style={styles.skillChip}
                  >
                    {skill}
                  </Chip>
                ))}
              </View>
            </View>

            <SegmentedButtons
              value={newWorker.isActive ? 'active' : 'inactive'}
              onValueChange={(value) => setNewWorker(prev => ({ ...prev, isActive: value === 'active' }))}
              buttons={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              style={styles.input}
            />

            <TextInput
              label="Notes (Optional)"
              value={newWorker.notes}
              onChangeText={(text) => setNewWorker(prev => ({ ...prev, notes: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setAddModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddWorker}
                style={styles.modalButton}
                disabled={!newWorker.firstName || !newWorker.lastName || !newWorker.email || !newWorker.phone}
              >
                Add Worker
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
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    color: '#666',
    marginTop: 4,
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  skillsSection: {
    marginBottom: 16,
  },
  skillsTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  skillsInput: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  skillInput: {
    flex: 1,
    marginBottom: 0,
  },
  addSkillButton: {
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});