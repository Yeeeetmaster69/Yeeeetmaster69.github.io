import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip, FAB, Searchbar, Surface, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalJobs: number;
  totalSpent: number;
  lastJobDate: number;
  status: 'active' | 'inactive';
  rating: number;
}

export default function ClientsTab() {
  const navigation = useNavigation();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    // Mock data - in real app, this would come from Firebase
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Springfield, IL',
        totalJobs: 8,
        totalSpent: 2450,
        lastJobDate: Date.now() - 86400000 * 7,
        status: 'active',
        rating: 4.8,
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 234-5678',
        address: '456 Oak Ave, Springfield, IL',
        totalJobs: 3,
        totalSpent: 890,
        lastJobDate: Date.now() - 86400000 * 14,
        status: 'active',
        rating: 4.9,
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '(555) 345-6789',
        address: '789 Pine St, Springfield, IL',
        totalJobs: 12,
        totalSpent: 4200,
        lastJobDate: Date.now() - 86400000 * 3,
        status: 'active',
        rating: 4.7,
      },
      {
        id: '4',
        name: 'Lisa Wilson',
        email: 'lisa.wilson@email.com',
        phone: '(555) 456-7890',
        address: '321 Elm St, Springfield, IL',
        totalJobs: 1,
        totalSpent: 150,
        lastJobDate: Date.now() - 86400000 * 60,
        status: 'inactive',
        rating: 5.0,
      },
    ];
    setClients(mockClients);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
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
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    totalSpent: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    avgJobValue: clients.reduce((sum, c) => sum + c.totalSpent, 0) / 
                 clients.reduce((sum, c) => sum + c.totalJobs, 0) || 0,
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Searchbar
          placeholder="Search clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="bodyLarge" style={styles.statValue}>{stats.total}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total Clients</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyLarge" style={styles.statValue}>{stats.active}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyLarge" style={styles.statValue}>{formatCurrency(stats.totalSpent)}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyLarge" style={styles.statValue}>{formatCurrency(stats.avgJobValue)}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Avg Job Value</Text>
          </View>
        </View>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredClients.map((client) => (
          <Card key={client.id} style={styles.clientCard}>
            <Card.Content>
              <View style={styles.clientHeader}>
                <Avatar.Text 
                  size={48} 
                  label={getInitials(client.name)}
                  style={styles.avatar}
                />
                <View style={styles.clientInfo}>
                  <View style={styles.nameRow}>
                    <Text variant="titleMedium" style={styles.clientName}>
                      {client.name}
                    </Text>
                    <Chip
                      mode="outlined"
                      textStyle={{ 
                        color: client.status === 'active' ? '#4caf50' : '#666',
                        fontSize: 12 
                      }}
                      style={[
                        styles.statusChip, 
                        { borderColor: client.status === 'active' ? '#4caf50' : '#666' }
                      ]}
                    >
                      {client.status}
                    </Chip>
                  </View>
                  <Text variant="bodySmall" style={styles.contactInfo}>
                    {client.email}
                  </Text>
                  <Text variant="bodySmall" style={styles.contactInfo}>
                    {client.phone}
                  </Text>
                </View>
              </View>
              
              <View style={styles.clientStats}>
                <View style={styles.statColumn}>
                  <Text variant="bodyLarge" style={styles.statNumber}>{client.totalJobs}</Text>
                  <Text variant="bodySmall" style={styles.statText}>Total Jobs</Text>
                </View>
                <View style={styles.statColumn}>
                  <Text variant="bodyLarge" style={styles.statNumber}>
                    {formatCurrency(client.totalSpent)}
                  </Text>
                  <Text variant="bodySmall" style={styles.statText}>Total Spent</Text>
                </View>
                <View style={styles.statColumn}>
                  <Text variant="bodyLarge" style={styles.statNumber}>{client.rating}★</Text>
                  <Text variant="bodySmall" style={styles.statText}>Rating</Text>
                </View>
                <View style={styles.statColumn}>
                  <Text variant="bodyLarge" style={styles.statNumber}>
                    {formatDate(client.lastJobDate)}
                  </Text>
                  <Text variant="bodySmall" style={styles.statText}>Last Job</Text>
                </View>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('Clients' as never)}>
                View Details
              </Button>
              <Button mode="contained" style={styles.contactButton}>
                Contact
              </Button>
            </Card.Actions>
          </Card>
        ))}
        
        {filteredClients.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No clients found matching your search
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Clients' as never)}
              style={styles.addButton}
            >
              Add New Client
            </Button>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Clients' as never)}
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
  clientCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  clientHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#19a974',
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
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
  clientStats: {
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
  },
  contactButton: {
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