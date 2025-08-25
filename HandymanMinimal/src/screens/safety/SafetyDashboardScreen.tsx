// Safety & Compliance: Admin Safety Dashboard
// Placeholder implementation for admin safety management

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  DataTable,
  Badge,
  Button,
  FAB,
  Chip
} from 'react-native-paper';

interface IncidentSummary {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reporterName: string;
  createdAt: Date;
}

interface SafetyMetrics {
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  activeSOS: number;
  pendingBackgroundChecks: number;
}

export default function SafetyDashboardScreen() {
  const [metrics, setMetrics] = useState<SafetyMetrics>({
    totalIncidents: 0,
    openIncidents: 0,
    criticalIncidents: 0,
    activeSOS: 0,
    pendingBackgroundChecks: 0
  });

  const [recentIncidents, setRecentIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    try {
      // TODO: Load data from Firestore
      // 1. Get incident counts by status and severity
      // 2. Get active SOS events
      // 3. Get pending background checks
      // 4. Load recent incidents for overview
      
      // Mock data for placeholder
      setMetrics({
        totalIncidents: 12,
        openIncidents: 3,
        criticalIncidents: 1,
        activeSOS: 0,
        pendingBackgroundChecks: 5
      });

      setRecentIncidents([
        {
          id: '1',
          title: 'Slip and fall on wet floor',
          type: 'injury',
          severity: 'medium',
          status: 'investigating',
          reporterName: 'John Smith',
          createdAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#d32f2f';
      case 'investigating': return '#f57c00';
      case 'resolved': return '#388e3c';
      case 'closed': return '#757575';
      default: return '#757575';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Emergency Alert */}
      {metrics.activeSOS > 0 && (
        <Card style={[styles.card, styles.emergencyCard]}>
          <Card.Content>
            <Title style={styles.emergencyTitle}>🚨 ACTIVE EMERGENCY</Title>
            <Paragraph style={styles.emergencyText}>
              {metrics.activeSOS} active SOS event(s) require immediate attention
            </Paragraph>
            <Button 
              mode="contained" 
              style={styles.emergencyButton}
              onPress={() => {/* Navigate to SOS response */}}
            >
              Respond to Emergency
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Safety Metrics Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Safety Overview</Title>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Paragraph style={styles.metricNumber}>{metrics.totalIncidents}</Paragraph>
              <Paragraph style={styles.metricLabel}>Total Incidents</Paragraph>
            </View>
            <View style={styles.metricItem}>
              <Paragraph style={[styles.metricNumber, { color: '#d32f2f' }]}>
                {metrics.openIncidents}
              </Paragraph>
              <Paragraph style={styles.metricLabel}>Open</Paragraph>
            </View>
            <View style={styles.metricItem}>
              <Paragraph style={[styles.metricNumber, { color: '#f57c00' }]}>
                {metrics.criticalIncidents}
              </Paragraph>
              <Paragraph style={styles.metricLabel}>Critical</Paragraph>
            </View>
            <View style={styles.metricItem}>
              <Paragraph style={styles.metricNumber}>{metrics.pendingBackgroundChecks}</Paragraph>
              <Paragraph style={styles.metricLabel}>Pending Checks</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Incidents */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Incidents</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Incident</DataTable.Title>
              <DataTable.Title>Severity</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Reporter</DataTable.Title>
            </DataTable.Header>

            {recentIncidents.map((incident) => (
              <DataTable.Row key={incident.id}>
                <DataTable.Cell>{incident.title}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip 
                    style={{ backgroundColor: getSeverityColor(incident.severity) }}
                    textStyle={{ color: 'white' }}
                  >
                    {incident.severity}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Badge style={{ backgroundColor: getStatusColor(incident.status) }}>
                    {incident.status}
                  </Badge>
                </DataTable.Cell>
                <DataTable.Cell>{incident.reporterName}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>

          <Button 
            mode="outlined" 
            style={styles.viewAllButton}
            onPress={() => {/* Navigate to incident list */}}
          >
            View All Incidents
          </Button>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Button 
              mode="outlined" 
              style={styles.quickActionButton}
              onPress={() => {/* Navigate to background checks */}}
            >
              Manage Background Checks
            </Button>
            <Button 
              mode="outlined" 
              style={styles.quickActionButton}
              onPress={() => {/* Navigate to safety analytics */}}
            >
              Safety Analytics
            </Button>
            <Button 
              mode="outlined" 
              style={styles.quickActionButton}
              onPress={() => {/* Navigate to compliance reports */}}
            >
              Compliance Reports
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Emergency Response FAB */}
      <FAB
        style={styles.emergencyFab}
        icon="phone-alert"
        label="Emergency Center"
        onPress={() => {
          // TODO: Navigate to emergency response center
          console.log('Opening emergency response center');
        }}
        color="#ffffff"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  emergencyCard: {
    backgroundColor: '#ffebee',
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  emergencyTitle: {
    color: '#d32f2f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emergencyText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  emergencyButton: {
    backgroundColor: '#d32f2f',
    marginTop: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  metricLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  viewAllButton: {
    marginTop: 16,
  },
  quickActions: {
    marginTop: 16,
  },
  quickActionButton: {
    marginBottom: 8,
  },
  emergencyFab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#d32f2f',
  },
});