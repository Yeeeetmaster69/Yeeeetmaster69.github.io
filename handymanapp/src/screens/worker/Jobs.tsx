
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip,
  Surface,
  IconButton,
  Badge,
  Searchbar,
  Menu,
  FAB
} from 'react-native-paper';
import { Job, JobStatus } from '../../utils/types';
import { listOpenJobs, assignSelf } from '../../services/jobs';
import { auth } from '../../config/firebase';

export default function Jobs({ navigation }: any) {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [allJobs, searchQuery, statusFilter]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Kitchen Faucet Repair',
          description: 'Replace leaky kitchen faucet and check water pressure',
          address: '123 Oak Street, Downtown',
          status: 'pending',
          priority: 'high',
          hourlyRate: 65,
          estimatedHours: 2,
          scheduledAt: Date.now() + 3600000,
          clientId: 'client1'
        },
        {
          id: '2',
          title: 'Bathroom Tile Repair',
          description: 'Fix cracked tiles in master bathroom shower area',
          address: '456 Pine Avenue, Suburb',
          status: 'pending',
          priority: 'medium',
          hourlyRate: 70,
          estimatedHours: 4,
          scheduledAt: Date.now() + 3600000 * 2,
          clientId: 'client2'
        },
        {
          id: '3',
          title: 'Deck Staining',
          description: 'Clean and stain wooden deck (250 sq ft)',
          address: '789 Maple Drive, Uptown',
          status: 'pending',
          priority: 'low',
          hourlyRate: 60,
          estimatedHours: 6,
          scheduledAt: Date.now() + 3600000 * 24,
          clientId: 'client3'
        },
        {
          id: '4',
          title: 'HVAC Maintenance',
          description: 'Annual HVAC system maintenance and filter replacement',
          address: '321 Elm Street, Midtown',
          status: 'active',
          priority: 'medium',
          hourlyRate: 75,
          estimatedHours: 3,
          scheduledAt: Date.now() - 3600000,
          workerId: auth.currentUser?.uid,
          clientId: 'client4'
        },
        {
          id: '5',
          title: 'Electrical Outlet Installation',
          description: 'Install 3 new electrical outlets in home office',
          address: '654 Cedar Lane, Westside',
          status: 'completed',
          priority: 'high',
          hourlyRate: 80,
          estimatedHours: 3,
          actualHours: 2.5,
          completedAt: Date.now() - 86400000,
          workerId: auth.currentUser?.uid,
          clientId: 'client5'
        }
      ];
      
      setAllJobs(mockJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterJobs = () => {
    let filtered = allJobs;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.address.toLowerCase().includes(query)
      );
    }
    
    setFilteredJobs(filtered);
  };

  const handleAssignSelf = async (jobId: string) => {
    try {
      await assignSelf(jobId, auth.currentUser!.uid);
      // Update job status locally
      setAllJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'active' as JobStatus, workerId: auth.currentUser!.uid }
          : job
      ));
    } catch (error) {
      console.error('Error assigning job:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'active': return '#4caf50';
      case 'completed': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff5722';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getJobCounts = () => {
    return {
      all: allJobs.length,
      pending: allJobs.filter(j => j.status === 'pending').length,
      active: allJobs.filter(j => j.status === 'active').length,
      completed: allJobs.filter(j => j.status === 'completed').length
    };
  };

  const counts = getJobCounts();

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Available Jobs
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Find and manage your assignments
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search jobs..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          
          <Menu
            visible={showFilterMenu}
            onDismiss={() => setShowFilterMenu(false)}
            anchor={
              <IconButton
                icon="filter-variant"
                onPress={() => setShowFilterMenu(true)}
                style={styles.filterButton}
              />
            }
          >
            <Menu.Item onPress={() => { setStatusFilter('all'); setShowFilterMenu(false); }} title="All Jobs" />
            <Menu.Item onPress={() => { setStatusFilter('pending'); setShowFilterMenu(false); }} title="Available" />
            <Menu.Item onPress={() => { setStatusFilter('active'); setShowFilterMenu(false); }} title="My Active Jobs" />
            <Menu.Item onPress={() => { setStatusFilter('completed'); setShowFilterMenu(false); }} title="Completed" />
          </Menu>
        </View>

        {/* Status Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          <Chip 
            selected={statusFilter === 'all'} 
            onPress={() => setStatusFilter('all')}
            style={styles.chip}
          >
            All ({counts.all})
          </Chip>
          <Chip 
            selected={statusFilter === 'pending'} 
            onPress={() => setStatusFilter('pending')}
            style={styles.chip}
          >
            Available ({counts.pending})
          </Chip>
          <Chip 
            selected={statusFilter === 'active'} 
            onPress={() => setStatusFilter('active')}
            style={styles.chip}
          >
            Active ({counts.active})
          </Chip>
          <Chip 
            selected={statusFilter === 'completed'} 
            onPress={() => setStatusFilter('completed')}
            style={styles.chip}
          >
            Completed ({counts.completed})
          </Chip>
        </ScrollView>

        {/* Jobs List */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredJobs.map((job) => (
            <Card key={job.id} style={styles.jobCard} onPress={() => navigation.navigate('JobDetail', { job })}>
              <Card.Content>
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleSection}>
                    <Text variant="titleMedium" style={styles.jobTitle}>
                      {job.title}
                    </Text>
                    <View style={styles.statusSection}>
                      <Chip 
                        mode="flat" 
                        compact
                        style={[styles.statusChip, { backgroundColor: getStatusColor(job.status!) + '20' }]}
                        textStyle={{ color: getStatusColor(job.status!) }}
                      >
                        {job.status}
                      </Chip>
                      {job.priority && (
                        <Chip 
                          mode="flat" 
                          compact
                          style={[styles.priorityChip, { backgroundColor: getPriorityColor(job.priority) + '20' }]}
                          textStyle={{ color: getPriorityColor(job.priority) }}
                        >
                          {job.priority}
                        </Chip>
                      )}
                    </View>
                  </View>
                  <Text variant="titleSmall" style={styles.hourlyRate}>
                    ${job.hourlyRate}/hr
                  </Text>
                </View>

                <Text variant="bodyMedium" style={styles.jobDescription}>
                  {job.description}
                </Text>

                <View style={styles.jobDetails}>
                  <Text variant="bodySmall" style={styles.jobAddress}>
                    📍 {job.address}
                  </Text>
                  {job.scheduledAt && (
                    <Text variant="bodySmall" style={styles.scheduledTime}>
                      🕐 {formatDate(job.scheduledAt)}
                    </Text>
                  )}
                  {job.estimatedHours && (
                    <Text variant="bodySmall" style={styles.estimatedHours}>
                      ⏱️ Estimated: {job.estimatedHours}h
                    </Text>
                  )}
                </View>

                <View style={styles.jobActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => navigation.navigate('JobDetail', { job })}
                    style={styles.detailsButton}
                  >
                    View Details
                  </Button>
                  
                  {job.status === 'pending' && !job.workerId && (
                    <Button 
                      mode="contained" 
                      onPress={() => handleAssignSelf(job.id!)}
                      style={styles.assignButton}
                    >
                      Take Job
                    </Button>
                  )}
                  
                  {job.status === 'active' && job.workerId === auth.currentUser?.uid && (
                    <Button 
                      mode="contained" 
                      onPress={() => navigation.navigate('ClockInOut')}
                      style={styles.assignButton}
                    >
                      Work on Job
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredJobs.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No jobs found
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtitle}>
                  {searchQuery ? 'Try adjusting your search' : 'Check back later for new opportunities'}
                </Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={onRefresh}
        label="Refresh"
      />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  searchbar: {
    flex: 1,
    backgroundColor: 'white',
  },
  filterButton: {
    backgroundColor: 'white',
    margin: 0,
  },
  chipContainer: {
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    backgroundColor: 'white',
  },
  jobCard: {
    backgroundColor: 'white',
    marginBottom: 16,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitleSection: {
    flex: 1,
  },
  jobTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  statusSection: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  priorityChip: {
    height: 24,
  },
  hourlyRate: {
    fontWeight: '700',
    color: '#2196f3',
  },
  jobDescription: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  jobDetails: {
    marginBottom: 16,
  },
  jobAddress: {
    color: '#666',
    marginBottom: 4,
  },
  scheduledTime: {
    color: '#666',
    marginBottom: 4,
  },
  estimatedHours: {
    color: '#666',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
  },
  assignButton: {
    flex: 1,
  },
  emptyCard: {
    backgroundColor: 'white',
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196f3',
  },
});
