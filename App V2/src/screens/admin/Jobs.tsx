
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Searchbar, 
  SegmentedButtons, 
  Text, 
  FAB, 
  Chip,
  Portal,
  Modal,
  Button,
  TextInput,
  Surface
} from 'react-native-paper';
import JobCard from '../../components/JobCard';
import { createJob, getJobsByStatus, updateJobStatus } from '../../services/jobs';
import { Job, JobStatus } from '../../utils/types';

export default function AdminJobs({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<JobStatus>('active');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  
  // Create job form state
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    address: '',
    hourlyRate: 50,
    estimatedHours: 2,
    priority: 'medium' as const
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
  ];

  useEffect(() => {
    loadJobs();
  }, [selectedStatus]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const jobsData = await getJobsByStatus(selectedStatus);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    if (!searchQuery.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const handleCreateJob = async () => {
    try {
      const jobId = await createJob({
        ...newJob,
        priceType: 'hourly',
        status: 'pending',
        createdAt: Date.now()
      });
      
      setCreateModalVisible(false);
      setNewJob({
        title: '',
        description: '',
        address: '',
        hourlyRate: 50,
        estimatedHours: 2,
        priority: 'medium'
      });
      
      loadJobs();
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleJobStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      // Update job status in Firebase
      await updateJobStatus(jobId, newStatus);
      
      // Update local state
      const updatedJobs = jobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      );
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const getJobCounts = () => {
    const counts = {
      pending: jobs.filter(j => j.status === 'pending').length,
      active: jobs.filter(j => j.status === 'active').length,
      upcoming: jobs.filter(j => j.status === 'upcoming').length,
      completed: jobs.filter(j => j.status === 'completed').length,
    };
    return counts;
  };

  const jobCounts = getJobCounts();

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Searchbar
          placeholder="Search jobs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.countsContainer}>
          {statusOptions.map(option => (
            <Chip
              key={option.value}
              mode={selectedStatus === option.value ? 'flat' : 'outlined'}
              selected={selectedStatus === option.value}
              onPress={() => setSelectedStatus(option.value as JobStatus)}
              style={styles.countChip}
            >
              {option.label} ({jobCounts[option.value as keyof typeof jobCounts]})
            </Chip>
          ))}
        </View>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {statusOptions.find(opt => opt.value === selectedStatus)?.label} Jobs
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
          </Text>
        </View>

        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No {selectedStatus} jobs found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Create a new job to get started'}
            </Text>
          </View>
        ) : (
          filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
              onStatusChange={(status) => handleJobStatusChange(job.id!, status)}
              showActions={selectedStatus === 'active'}
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={createModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Create New Job
            </Text>

            <TextInput
              label="Job Title"
              value={newJob.title}
              onChangeText={(text) => setNewJob(prev => ({ ...prev, title: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Description"
              value={newJob.description}
              onChangeText={(text) => setNewJob(prev => ({ ...prev, description: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Address"
              value={newJob.address}
              onChangeText={(text) => setNewJob(prev => ({ ...prev, address: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Hourly Rate ($)"
              value={newJob.hourlyRate.toString()}
              onChangeText={(text) => setNewJob(prev => ({ ...prev, hourlyRate: parseFloat(text) || 0 }))}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />

            <TextInput
              label="Estimated Hours"
              value={newJob.estimatedHours.toString()}
              onChangeText={(text) => setNewJob(prev => ({ ...prev, estimatedHours: parseFloat(text) || 0 }))}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
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
                onPress={handleCreateJob}
                style={styles.modalButton}
                disabled={!newJob.title || !newJob.description || !newJob.address}
              >
                Create Job
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
  countsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countChip: {
    marginBottom: 4,
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
