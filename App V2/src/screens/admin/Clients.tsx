import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
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
  List,
  Divider
} from 'react-native-paper';
import ClientCard from '../../components/ClientCard';
import { Client } from '../../utils/types';

export default function AdminClients({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  // Add client form state
  const [newClient, setNewClient] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    type: 'residential' | 'commercial';
    notes: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'residential',
    notes: ''
  });

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
  ];

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, filterType]);

  const loadClients = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockClients: Client[] = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567',
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          type: 'residential',
          totalJobs: 8,
          totalSpent: 2400,
          averageRating: 4.9,
          createdAt: Date.now() - 86400000 * 30
        },
        {
          id: '2',
          firstName: 'Mike',
          lastName: 'Chen',
          email: 'mike.chen@business.com',
          phone: '(555) 234-5678',
          address: '456 Oak Ave',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702',
          type: 'commercial',
          totalJobs: 15,
          totalSpent: 8750,
          averageRating: 4.7,
          createdAt: Date.now() - 86400000 * 60
        },
        {
          id: '3',
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@email.com',
          phone: '(555) 345-6789',
          address: '789 Pine St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703',
          type: 'residential',
          totalJobs: 3,
          totalSpent: 890,
          averageRating: 5.0,
          createdAt: Date.now() - 86400000 * 15
        }
      ];
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(client => client.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        client.address.toLowerCase().includes(query)
      );
    }

    setFilteredClients(filtered);
  };

  const handleAddClient = async () => {
    try {
      const client: Client = {
        ...newClient,
        totalJobs: 0,
        totalSpent: 0,
        createdAt: Date.now()
      };
      
      setClients(prev => [client, ...prev]);
      setAddModalVisible(false);
      
      // Reset form
      setNewClient({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        type: 'residential',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleClientPress = (client: Client) => {
    navigation.navigate('ClientDetail', { clientId: client.id });
  };

  const handleCall = async (client: Client) => {
    if (!client.phone) {
      Alert.alert('No Phone Number', 'This client does not have a phone number on file.');
      return;
    }
    
    try {
      const phoneUrl = `tel:${client.phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Unable to Call', 'Your device cannot make phone calls.');
      }
    } catch (error) {
      console.error('Error making phone call:', error);
      Alert.alert('Error', 'Failed to initiate phone call.');
    }
  };

  const handleEmail = async (client: Client) => {
    if (!client.email) {
      Alert.alert('No Email Address', 'This client does not have an email address on file.');
      return;
    }
    
    try {
      const emailUrl = `mailto:${client.email}?subject=Handyman Services&body=Hello ${client.firstName || 'there'},\n\nI hope this email finds you well. I wanted to follow up regarding our handyman services.\n\nBest regards,\nHandyman Pro Team`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Unable to Send Email', 'Your device cannot send emails or no email app is configured.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to open email client.');
    }
  };

  const getClientCounts = () => {
    return {
      all: clients.length,
      residential: clients.filter(c => c.type === 'residential').length,
      commercial: clients.filter(c => c.type === 'commercial').length,
    };
  };

  const clientCounts = getClientCounts();

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Searchbar
          placeholder="Search clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <SegmentedButtons
          value={filterType}
          onValueChange={setFilterType}
          buttons={filterOptions.map(option => ({
            ...option,
            label: `${option.label} (${clientCounts[option.value as keyof typeof clientCounts]})`
          }))}
          style={styles.segmentedButtons}
        />
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)} Clients
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
          </Text>
        </View>

        {filteredClients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No clients found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first client to get started'}
            </Text>
          </View>
        ) : (
          filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onPress={() => handleClientPress(client)}
              onCall={() => handleCall(client)}
              onEmail={() => handleEmail(client)}
              showActions={true}
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
              Add New Client
            </Text>

            <View style={styles.row}>
              <TextInput
                label="First Name"
                value={newClient.firstName}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, firstName: text }))}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
              />
              <TextInput
                label="Last Name"
                value={newClient.lastName}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, lastName: text }))}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
              />
            </View>

            <TextInput
              label="Email"
              value={newClient.email}
              onChangeText={(text) => setNewClient(prev => ({ ...prev, email: text }))}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />

            <TextInput
              label="Phone"
              value={newClient.phone}
              onChangeText={(text) => setNewClient(prev => ({ ...prev, phone: text }))}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />

            <TextInput
              label="Address"
              value={newClient.address}
              onChangeText={(text) => setNewClient(prev => ({ ...prev, address: text }))}
              style={styles.input}
              mode="outlined"
            />

            <View style={styles.row}>
              <TextInput
                label="City"
                value={newClient.city}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, city: text }))}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
              />
              <TextInput
                label="State"
                value={newClient.state}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, state: text }))}
                style={[styles.input, styles.quarterWidth]}
                mode="outlined"
              />
              <TextInput
                label="Zip Code"
                value={newClient.zipCode}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, zipCode: text }))}
                style={[styles.input, styles.quarterWidth]}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>

            <SegmentedButtons
              value={newClient.type}
              onValueChange={(value) => setNewClient(prev => ({ ...prev, type: value as 'residential' | 'commercial' }))}
              buttons={[
                { value: 'residential', label: 'Residential' },
                { value: 'commercial', label: 'Commercial' }
              ]}
              style={styles.input}
            />

            <TextInput
              label="Notes (Optional)"
              value={newClient.notes}
              onChangeText={(text) => setNewClient(prev => ({ ...prev, notes: text }))}
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
                onPress={handleAddClient}
                style={styles.modalButton}
                disabled={!newClient.firstName || !newClient.lastName || !newClient.email || !newClient.phone}
              >
                Add Client
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
  quarterWidth: {
    flex: 0.5,
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