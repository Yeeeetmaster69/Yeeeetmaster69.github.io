import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip, FAB, Searchbar, Surface, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  status: 'active' | 'inactive' | 'busy';
  totalJobs: number;
  rating: number;
  hourlyRate: number;
  joinDate: number;
  lastActive: number;
}

export default function WorkersTab() {
  const navigation = useNavigation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    // Mock data - in real app, this would come from Firebase
    const mockWorkers: Worker[] = [
      {
        id: '1',
        name: 'Alex Thompson',
        email: 'alex.thompson@handyman.com',
        phone: '(555) 111-2222',
        skills: ['Plumbing', 'Electrical', 'General Repair'],
        status: 'active',
        totalJobs: 142,
        rating: 4.8,
        hourlyRate: 75,
        joinDate: Date.now() - 86400000 * 365,
        lastActive: Date.now() - 86400000,
      },
      {
        id: '2',
        name: 'Maria Garcia',
        email: 'maria.garcia@handyman.com',
        phone: '(555) 222-3333',
        skills: ['Carpentry', 'Flooring', 'Painting'],
        status: 'busy',
        totalJobs: 89,
        rating: 4.9,
        hourlyRate: 70,
        joinDate: Date.now() - 86400000 * 180,
        lastActive: Date.now() - 3600000,
      },
      {
        id: '3',
        name: 'David Kim',
        email: 'david.kim@handyman.com',
        phone: '(555) 333-4444',
        skills: ['HVAC', 'Appliance Repair'],
        status: 'active',
        totalJobs: 56,
        rating: 4.7,
        hourlyRate: 80,
        joinDate: Date.now() - 86400000 * 90,
        lastActive: Date.now() - 7200000,
      },
      {
        id: '4',
        name: 'Jennifer Lee',
        email: 'jennifer.lee@handyman.com',
        phone: '(555) 444-5555',
        skills: ['Interior Design', 'Painting', 'Tiling'],
        status: 'inactive',
        totalJobs: 23,
        rating: 4.6,
        hourlyRate: 65,
        joinDate: Date.now() - 86400000 * 30,
        lastActive: Date.now() - 86400000 * 7,
      },
    ];
    setWorkers(mockWorkers);
  };

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'busy': return '#ff9800';
      case 'inactive': return '#666';
      default: return '#666';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const stats = {
    total: workers.length,
    active: workers.filter(w => w.status === 'active').length,
    busy: workers.filter(w => w.status === 'busy').length,
    avgRating: workers.reduce((sum, w) => sum + w.rating, 0) / workers.length || 0,
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Searchbar
          placeholder="Search workers or skills..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="bodyLarge" style={styles.statValue}>{stats.total}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total Workers</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyLarge" style={styles.statValue}>{stats.active}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyLarge" style={styles.statValue}>{stats.busy}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Busy</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyLarge" style={styles.statValue}>{stats.avgRating.toFixed(1)}★</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredWorkers.map((worker) => (
          <Card key={worker.id} style={styles.workerCard}>
            <Card.Content>
              <View style={styles.workerHeader}>
                <Avatar.Text 
                  size={48} 
                  label={getInitials(worker.name)}
                  style={styles.avatar}
                />
                <View style={styles.workerInfo}>
                  <View style={styles.nameRow}>
                    <Text variant="titleMedium" style={styles.workerName}>
                      {worker.name}
                    </Text>
                    <Chip
                      mode="outlined"
                      textStyle={{ 
                        color: getStatusColor(worker.status),
                        fontSize: 12 
                      }}
                      style={[
                        styles.statusChip, 
                        { borderColor: getStatusColor(worker.status) }
                      ]}
                    >
                      {worker.status}
                    </Chip>
                  </View>
                  <Text variant="bodySmall" style={styles.contactInfo}>
                    {worker.email}
                  </Text>
                  <Text variant="bodySmall" style={styles.contactInfo}>
                    {worker.phone} • ${worker.hourlyRate}/hr
                  </Text>
                </View>
              </View>
              
              <View style={styles.skillsContainer}>
                <Text variant="bodySmall" style={styles.skillsLabel}>Skills:</Text>
                <View style={styles.skillsRow}>
                  {worker.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      textStyle={{ fontSize: 10 }}
                      style={styles.skillChip}
                    >
                      {skill}
                    </Chip>
                  ))}
                </View>
              </View>
              
              <View style={styles.workerStats}>
                <View style={styles.statColumn}>
                  <Text variant="bodyLarge" style={styles.statNumber}>{worker.totalJobs}</Text>
                  <Text variant="bodySmall" style={styles.statText}>Jobs Completed</Text>
                </View>
                <View style={styles.statColumn}>
                  <Text variant="bodyLarge" style={styles.statNumber}>{worker.rating}★</Text>
                  <Text variant="bodySmall" style={styles.statText}>Rating</Text>
                </View>
                <View style={styles.statColumn}>
                  <Text variant="bodyLarge" style={styles.statNumber}>
                    {formatDate(worker.joinDate)}
                  </Text>
                  <Text variant="bodySmall" style={styles.statText}>Joined</Text>
                </View>
                <View style={styles.statColumn}>
                  <Text variant="bodyLarge" style={styles.statNumber}>
                    {formatDate(worker.lastActive)}
                  </Text>
                  <Text variant="bodySmall" style={styles.statText}>Last Active</Text>
                </View>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('Workers' as never)}>
                View Profile
              </Button>
              <Button mode="contained" style={styles.assignButton}>
                Assign Job
              </Button>
            </Card.Actions>
          </Card>
        ))}
        
        {filteredWorkers.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No workers found matching your search
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Workers' as never)}
              style={styles.addButton}
            >
              Add New Worker
            </Button>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Workers' as never)}
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '600',
    color: '#19a974',
  },
  statLabel: {
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  workerCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  workerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#19a974',
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workerName: {
    fontWeight: '600',
    flex: 1,
  },
  statusChip: {
    height: 24,
    marginLeft: 8,
  },
  contactInfo: {
    color: '#666',
    marginBottom: 2,
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsLabel: {
    color: '#666',
    marginBottom: 4,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillChip: {
    height: 24,
    backgroundColor: '#f0f8f5',
    borderColor: '#19a974',
  },
  workerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statText: {
    color: '#666',
    marginTop: 2,
    fontSize: 10,
  },
  assignButton: {
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
  addButton: {
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