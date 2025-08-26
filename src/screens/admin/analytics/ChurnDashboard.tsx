import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, Card, Chip } from 'react-native-paper';
import StatsCard from '../../../components/StatsCard';

// Placeholder Churn Prediction Dashboard
// This is a scaffolded implementation to be enhanced in Phase 1

export default function ChurnDashboard({ navigation }: any) {
  // Mock data for demonstration
  const atRiskClients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      riskScore: 85,
      riskLevel: 'high' as const,
      lastService: '45 days ago',
      factors: ['Decreased frequency', 'Payment delays']
    },
    {
      id: '2', 
      name: 'Mike Chen',
      riskScore: 72,
      riskLevel: 'medium' as const,
      lastService: '28 days ago',
      factors: ['Low satisfaction scores', 'No recent bookings']
    },
    {
      id: '3',
      name: 'Emma Davis',
      riskScore: 91,
      riskLevel: 'critical' as const,
      lastService: '67 days ago',
      factors: ['Long absence', 'Negative feedback', 'Price complaints']
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Churn Prediction
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Identify and retain at-risk clients
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Risk Overview */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Risk Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <StatsCard
              title="Critical Risk"
              value="1"
              subtitle="Immediate attention"
              icon="🚨"
              color="#d32f2f"
            />
            <StatsCard
              title="High Risk"
              value="2"
              subtitle="Action needed"
              icon="⚠️"
              color="#f57c00"
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              title="Medium Risk"
              value="5"
              subtitle="Monitor closely"
              icon="📊"
              color="#fbc02d"
            />
            <StatsCard
              title="Retention Rate"
              value="87%"
              subtitle="Last 30 days"
              icon="📈"
              color="#388e3c"
              trend={{ value: 3.2, isPositive: true }}
            />
          </View>
        </View>

        {/* At-Risk Clients */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            At-Risk Clients
          </Text>
          
          {atRiskClients.map((client) => (
            <Card key={client.id} style={styles.clientCard}>
              <Card.Content>
                <View style={styles.clientHeader}>
                  <View style={styles.clientInfo}>
                    <Text variant="titleMedium" style={styles.clientName}>
                      {client.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.lastService}>
                      Last service: {client.lastService}
                    </Text>
                  </View>
                  <View style={styles.riskBadge}>
                    <Chip 
                      style={[styles.riskChip, { backgroundColor: getRiskColor(client.riskLevel) }]}
                      textStyle={{ color: 'white', fontWeight: '600' }}
                    >
                      {client.riskScore}% Risk
                    </Chip>
                  </View>
                </View>
                
                <View style={styles.factorsContainer}>
                  <Text variant="bodySmall" style={styles.factorsLabel}>
                    Risk Factors:
                  </Text>
                  <View style={styles.factorsList}>
                    {client.factors.map((factor, index) => (
                      <Chip key={index} mode="outlined" style={styles.factorChip}>
                        {factor}
                      </Chip>
                    ))}
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Implementation Status */}
        <View style={styles.section}>
          <Card style={styles.statusCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.statusTitle}>
                🚧 Implementation Status
              </Text>
              <Text variant="bodyMedium" style={styles.statusText}>
                This is a placeholder implementation showing mock data.
              </Text>
              <Text variant="bodySmall" style={styles.statusSubtext}>
                The actual churn prediction algorithm will be implemented in Phase 1, incorporating:
              </Text>
              
              <View style={styles.featuresList}>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Booking frequency analysis
                </Text>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Payment behavior tracking
                </Text>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Satisfaction trend analysis
                </Text>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Engagement level scoring
                </Text>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Automated intervention recommendations
                </Text>
              </View>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
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
    gap: 12,
    marginBottom: 12,
  },
  clientCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  lastService: {
    color: '#666',
    marginTop: 4,
  },
  riskBadge: {
    marginLeft: 12,
  },
  riskChip: {
    borderRadius: 16,
  },
  factorsContainer: {
    marginTop: 8,
  },
  factorsLabel: {
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  factorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  factorChip: {
    marginBottom: 4,
  },
  statusCard: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
    borderWidth: 1,
  },
  statusTitle: {
    color: '#e65100',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    color: '#ef6c00',
    marginBottom: 8,
  },
  statusSubtext: {
    color: '#f57c00',
    marginBottom: 12,
  },
  featuresList: {
    gap: 4,
  },
  featureItem: {
    color: '#f57c00',
    fontSize: 12,
  },
});