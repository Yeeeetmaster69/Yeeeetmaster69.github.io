import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const mockJobs = [
  {
    id: '1',
    title: 'Kitchen Faucet Repair',
    status: 'In Progress',
    worker: 'John Smith',
    date: '2024-01-15',
  },
  {
    id: '2',
    title: 'Bathroom Tile Installation',
    status: 'Completed',
    worker: 'Mike Johnson',
    date: '2024-01-10',
  },
];

export default function ClientJobs() {
  const renderJob = ({ item }: { item: any }) => (
    <View style={styles.jobCard}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobDetails}>Worker: {item.worker}</Text>
      <Text style={styles.jobDetails}>Date: {item.date}</Text>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'Completed' ? '#4CAF50' : '#FF9800' }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Jobs</Text>
      
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});