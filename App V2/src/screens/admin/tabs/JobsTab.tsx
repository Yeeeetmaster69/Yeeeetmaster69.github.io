import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip, FAB, Searchbar, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface Job {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientName: string;
  estimatedHours: number;
  hourlyRate: number;
  createdAt: number;
}

export default function JobsTab() {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    // Mock data - in real app, this would come from Firebase
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Kitchen Renovation',
        description: 'Complete kitchen remodel with new cabinets and countertops',
        status: 'active',
        priority: 'high',
        clientName: 'John Smith',
        estimatedHours: 40,
        hourlyRate: 75,
        createdAt: Date.now() - 86400000,
      },
      {
        id: '2',
        title: 'Bathroom Repair',
        description: 'Fix leaky faucet and replace shower tiles',
        status: 'pending',
        priority: 'medium',
        clientName: 'Sarah Johnson',
        estimatedHours: 8,
        hourlyRate: 60,
        createdAt: Date.now() - 172800000,
      },
      {
        id: '3',
        title: 'Deck Installation',
        description: 'Build new wooden deck in backyard',
        status: 'pending',
        priority: 'low',
        clientName: 'Mike Davis',
        estimatedHours: 24,
        hourlyRate: 65,
        createdAt: Date.now() - 259200000,
      },
    ];
    setJobs(mockJobs);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || job.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'active': return '#2196f3';
      case 'completed': return '#4caf50';
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

  const jobCounts = {
    all: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    active: jobs.filter(j => j.status === 'active').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Searchbar
          placeholder="Search jobs or clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.filterChips}>
          {Object.entries(jobCounts).map(([key, count]) => (
            <Chip
              key={key}
              mode={filter === key ? 'flat' : 'outlined'}
              selected={filter === key}
              onPress={() => setFilter(key as any)}
              style={styles.filterChip}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
            </Chip>
          ))}
        </View>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredJobs.map((job) => (
          <Card key={job.id} style={styles.jobCard}>
            <Card.Content>
              <View style={styles.jobHeader}>
                <Text variant="titleMedium" style={styles.jobTitle}>
                  {job.title}
                </Text>
                <View style={styles.badges}>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: getStatusColor(job.status) }}
                    style={[styles.statusChip, { borderColor: getStatusColor(job.status) }]}
                  >
                    {job.status}
                  </Chip>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: getPriorityColor(job.priority) }}
                    style={[styles.priorityChip, { borderColor: getPriorityColor(job.priority) }]}
                  >
                    {job.priority}
                  </Chip>
                </View>
              </View>
              
              <Text variant="bodyMedium" style={styles.description}>
                {job.description}
              </Text>
              
              <View style={styles.jobDetails}>
                <Text variant="bodySmall" style={styles.client}>
                  Client: {job.clientName}
                </Text>
                <Text variant="bodySmall" style={styles.estimate}>
                  Est: {job.estimatedHours}h × ${job.hourlyRate}/h = ${job.estimatedHours * job.hourlyRate}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('AdminJobs' as never)}>
                View Details
              </Button>
              <Button mode="contained" style={styles.manageButton}>
                Manage
              </Button>
            </Card.Actions>
          </Card>
        ))}
        
        {filteredJobs.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No jobs found matching your criteria
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('AdminJobs' as never)}
              style={styles.createButton}
            >
              Create New Job
            </Button>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AdminJobs' as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  jobCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    flex: 1,
    fontWeight: '600',
    marginRight: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  statusChip: {
    height: 24,
  },
  priorityChip: {
    height: 24,
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  client: {
    color: '#666',
  },
  estimate: {
    color: '#666',
    fontWeight: '500',
  },
  manageButton: {
    backgroundColor: '#19a974',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#19a974',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#19a974',
  },
});