import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip, Searchbar, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface SafetyStats {
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  pendingBackgroundChecks: number;
  activeEmergencyAlerts: number;
  workerSafetyScore: number;
}

export default function SafetyTab() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<SafetyStats>({
    totalIncidents: 0,
    openIncidents: 0,
    criticalIncidents: 0,
    pendingBackgroundChecks: 0,
    activeEmergencyAlerts: 0,
    workerSafetyScore: 95.2
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSafetyStats();
  }, []);

  const loadSafetyStats = async () => {
    try {
      setLoading(true);
      
      // Load incidents data
      const incidentsQuery = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
      const incidentsSnapshot = await getDocs(incidentsQuery);
      const incidents = incidentsSnapshot.docs.map(doc => doc.data());
      
      // Load background checks data
      const checksQuery = query(
        collection(db, 'background_checks'), 
        where('status', '==', 'pending')
      );
      const checksSnapshot = await getDocs(checksQuery);
      
      // Load emergency alerts data
      const alertsQuery = query(
        collection(db, 'emergency_alerts'), 
        where('status', '==', 'active')
      );
      const alertsSnapshot = await getDocs(alertsQuery);
      
      setStats({
        totalIncidents: incidents.length,
        openIncidents: incidents.filter(i => i.status === 'reported' || i.status === 'investigating').length,
        criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
        pendingBackgroundChecks: checksSnapshot.docs.length,
        activeEmergencyAlerts: alertsSnapshot.docs.length,
        workerSafetyScore: 95.2 // This would be calculated based on various factors
      });
    } catch (error) {
      console.error('Error loading safety stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, threshold: number) => {
    if (value === 0) return '#4caf50';
    if (value <= threshold) return '#ff9800';
    return '#f44336';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="titleLarge" style={styles.title}>
          Safety & Compliance Overview
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Monitor safety metrics and compliance status
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Current Status
          </Text>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="displaySmall" style={[styles.statValue, { color: getStatusColor(stats.openIncidents, 2) }]}>
                  {stats.openIncidents}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>Open Incidents</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="displaySmall" style={[styles.statValue, { color: getStatusColor(stats.criticalIncidents, 0) }]}>
                  {stats.criticalIncidents}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>Critical</Text>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="displaySmall" style={[styles.statValue, { color: getStatusColor(stats.activeEmergencyAlerts, 0) }]}>
                  {stats.activeEmergencyAlerts}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>Active Alerts</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="displaySmall" style={[styles.statValue, { color: '#19a974' }]}>
                  {stats.workerSafetyScore}%
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>Safety Score</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Safety Management
          </Text>
          
          <View style={styles.actionGrid}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('IncidentReporting' as never)}
              style={styles.actionButton}
              icon="alert-circle"
              buttonColor="#19a974"
            >
              Incident Reports
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('BackgroundChecks' as never)}
              style={styles.actionButton}
              icon="account-check"
            >
              Background Checks
            </Button>
          </View>
          
          <View style={styles.actionGrid}>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('EmergencyContact' as never)}
              style={styles.actionButton}
              icon="phone"
            >
              Emergency Contacts
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Workers' as never)}
              style={styles.actionButton}
              icon="shield-check"
            >
              Safety Training
            </Button>
          </View>
        </View>

        {/* Compliance Status */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Compliance Status
          </Text>
          
          <Card style={styles.complianceCard}>
            <Card.Content>
              <View style={styles.complianceRow}>
                <Text variant="bodyLarge">Background Checks</Text>
                <Chip 
                  mode="outlined"
                  style={{ borderColor: getStatusColor(stats.pendingBackgroundChecks, 3) }}
                  textStyle={{ color: getStatusColor(stats.pendingBackgroundChecks, 3) }}
                >
                  {stats.pendingBackgroundChecks} Pending
                </Chip>
              </View>
              
              <View style={styles.complianceRow}>
                <Text variant="bodyLarge">Safety Training</Text>
                <Chip 
                  mode="outlined"
                  style={{ borderColor: '#4caf50' }}
                  textStyle={{ color: '#4caf50' }}
                >
                  Up to Date
                </Chip>
              </View>
              
              <View style={styles.complianceRow}>
                <Text variant="bodyLarge">Insurance Coverage</Text>
                <Chip 
                  mode="outlined"
                  style={{ borderColor: '#4caf50' }}
                  textStyle={{ color: '#4caf50' }}
                >
                  Active
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          
          <Card style={styles.activityCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.activityItem}>
                🚨 New incident reported by Worker #245
              </Text>
              <Text variant="bodySmall" style={styles.activityTime}>2 hours ago</Text>
              
              <Text variant="bodyMedium" style={[styles.activityItem, { marginTop: 12 }]}>
                ✅ Background check completed for new worker
              </Text>
              <Text variant="bodySmall" style={styles.activityTime}>Yesterday</Text>
              
              <Text variant="bodyMedium" style={[styles.activityItem, { marginTop: 12 }]}>
                📋 Safety training updated for all workers
              </Text>
              <Text variant="bodySmall" style={styles.activityTime}>3 days ago</Text>
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScrollView>
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
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
  },
  statValue: {
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
  },
  complianceCard: {
    backgroundColor: 'white',
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: 'white',
  },
  activityItem: {
    color: '#333',
  },
  activityTime: {
    color: '#999',
    marginTop: 4,
  },
});