import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const mockJobs = [
  {
    id: '1',
    title: 'Kitchen Faucet Repair',
    client: 'Jane Doe',
    address: '123 Main St',
    payment: '$75/hour',
    status: 'Available',
  },
  {
    id: '2',
    title: 'Bathroom Tile Installation',
    client: 'Bob Smith',
    address: '456 Oak Ave',
    payment: '$90/hour',
    status: 'Assigned',
  },
];

export default function WorkerJobs() {
  const renderJob = ({ item }: { item: any }) => (
    <View style={styles.jobCard}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobDetails}>Client: {item.client}</Text>
      <Text style={styles.jobDetails}>Address: {item.address}</Text>
      <Text style={styles.jobDetails}>Payment: {item.payment}</Text>
      
      <View style={styles.actionContainer}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Available' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        
        {item.status === 'Available' && (
          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Jobs</Text>
      
      <FlatList
        data={mockJobs}
        renderItem={renderJob}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  jobCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  jobDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});