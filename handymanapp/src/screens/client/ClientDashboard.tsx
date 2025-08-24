import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ClientDashboard() {
  const { primaryColor } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome to Handyman Pro</Text>
        <Text style={styles.subtitle}>Your trusted home service platform</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={[styles.actionCard, { borderLeftColor: primaryColor }]}>
          <Text style={styles.actionTitle}>Request Service</Text>
          <Text style={styles.actionDescription}>Get help with your home projects</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, { borderLeftColor: primaryColor }]}>
          <Text style={styles.actionTitle}>View My Jobs</Text>
          <Text style={styles.actionDescription}>Check the status of your requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, { borderLeftColor: primaryColor }]}>
          <Text style={styles.actionTitle}>Find Workers</Text>
          <Text style={styles.actionDescription}>Browse available professionals</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>No recent activity</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  quickActions: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  actionCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  recentActivity: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 8,
  },
  activityCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  activityText: {
    fontSize: 14,
    color: '#666',
  },
});