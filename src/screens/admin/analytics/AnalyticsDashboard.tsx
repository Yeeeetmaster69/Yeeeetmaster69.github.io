import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, Card, Button } from 'react-native-paper';
import StatsCard from '../../../components/StatsCard';

// Placeholder Analytics Dashboard for Data Insights
// This is a scaffolded implementation to be enhanced in subsequent phases

export default function AnalyticsDashboard({ navigation }: any) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Data Insights Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Advanced analytics and business intelligence
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Quick Overview Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <StatsCard
              title="Churn Risk Alerts"
              value="3"
              subtitle="High-risk clients"
              icon="⚠️"
              color="#f44336"
              onPress={() => navigation.navigate('ChurnDashboard')}
            />
            <StatsCard
              title="Sentiment Score"
              value="8.2"
              subtitle="Overall rating"
              icon="😊"
              color="#4caf50"
              trend={{ value: 5.1, isPositive: true }}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              title="Negative Feedback"
              value="2"
              subtitle="Requiring attention"
              icon="📝"
              color="#ff9800"
              onPress={() => navigation.navigate('SentimentDashboard')}
            />
            <StatsCard
              title="Retention Rate"
              value="87%"
              subtitle="Last 90 days"
              icon="📈"
              color="#2196f3"
              trend={{ value: 3.2, isPositive: true }}
            />
          </View>
        </View>

        {/* Feature Modules Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Analytics Modules
          </Text>
          
          <Card style={styles.moduleCard}>
            <Card.Content>
              <View style={styles.moduleHeader}>
                <Text variant="titleMedium" style={styles.moduleTitle}>
                  🔮 Churn Prediction
                </Text>
                <Text variant="bodyMedium" style={styles.moduleDescription}>
                  Identify at-risk clients and prevent customer churn with predictive analytics
                </Text>
              </View>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('ChurnDashboard')}
                style={styles.moduleButton}
              >
                View Churn Analysis
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.moduleCard}>
            <Card.Content>
              <View style={styles.moduleHeader}>
                <Text variant="titleMedium" style={styles.moduleTitle}>
                  💭 Sentiment Analysis
                </Text>
                <Text variant="bodyMedium" style={styles.moduleDescription}>
                  Monitor customer feedback and detect issues through sentiment analysis
                </Text>
              </View>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('SentimentDashboard')}
                style={styles.moduleButton}
              >
                View Sentiment Trends
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.moduleCard}>
            <Card.Content>
              <View style={styles.moduleHeader}>
                <Text variant="titleMedium" style={styles.moduleTitle}>
                  📊 Advanced Analytics
                </Text>
                <Text variant="bodyMedium" style={styles.moduleDescription}>
                  Comprehensive business intelligence with predictive insights
                </Text>
              </View>
              <Button 
                mode="outlined" 
                onPress={() => {/* TODO: Navigate to advanced analytics */}}
                style={styles.moduleButton}
                disabled
              >
                Coming Soon
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Implementation Status */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Implementation Status
          </Text>
          
          <Card style={styles.statusCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.statusText}>
                🚧 This is a scaffolded implementation of the Data Insights module.
              </Text>
              <Text variant="bodySmall" style={styles.statusSubtext}>
                Full functionality will be implemented in subsequent phases as outlined in DATA_INSIGHTS.md
              </Text>
              
              <View style={styles.roadmapList}>
                <Text variant="bodySmall" style={styles.roadmapItem}>
                  ✅ Phase 0: Documentation and architecture design
                </Text>
                <Text variant="bodySmall" style={styles.roadmapItem}>
                  🔄 Phase 1: Foundation and basic algorithms (In Progress)
                </Text>
                <Text variant="bodySmall" style={styles.roadmapItem}>
                  ⏳ Phase 2: Core dashboard features
                </Text>
                <Text variant="bodySmall" style={styles.roadmapItem}>
                  ⏳ Phase 3: Advanced ML and AI integration
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
  moduleCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  moduleHeader: {
    marginBottom: 16,
  },
  moduleTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  moduleDescription: {
    color: '#666',
    lineHeight: 20,
  },
  moduleButton: {
    alignSelf: 'flex-start',
  },
  statusCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  statusText: {
    color: '#1565c0',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusSubtext: {
    color: '#1976d2',
    marginBottom: 16,
  },
  roadmapList: {
    gap: 6,
  },
  roadmapItem: {
    color: '#1976d2',
    fontSize: 12,
  },
});