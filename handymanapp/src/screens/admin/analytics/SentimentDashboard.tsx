import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, Card, Chip } from 'react-native-paper';
import StatsCard from '../../../components/StatsCard';

// Placeholder Sentiment Analysis Dashboard
// This is a scaffolded implementation to be enhanced in Phase 1

export default function SentimentDashboard({ navigation }: any) {
  // Mock data for demonstration
  const recentFeedback = [
    {
      id: '1',
      client: 'Sarah Johnson',
      content: 'The service was excellent! Very professional and thorough work.',
      sentiment: { score: 0.8, classification: 'positive' as const },
      topics: ['service quality', 'professionalism'],
      actionRequired: false,
      date: '2 hours ago'
    },
    {
      id: '2',
      client: 'Mike Chen', 
      content: 'Worker was late and seemed rushed. Not satisfied with the results.',
      sentiment: { score: -0.6, classification: 'negative' as const },
      topics: ['punctuality', 'work quality'],
      actionRequired: true,
      date: '5 hours ago'
    },
    {
      id: '3',
      client: 'Emma Davis',
      content: 'Good work overall, but pricing seems a bit high compared to others.',
      sentiment: { score: 0.1, classification: 'neutral' as const },
      topics: ['pricing', 'work quality'],
      actionRequired: false,
      date: '1 day ago'
    }
  ];

  const getSentimentColor = (classification: string) => {
    switch (classification) {
      case 'positive': return '#4caf50';
      case 'negative': return '#f44336';
      case 'neutral': return '#ff9800';
      default: return '#666';
    }
  };

  const getSentimentIcon = (classification: string) => {
    switch (classification) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '❓';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Sentiment Analysis
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Monitor customer feedback and satisfaction trends
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Sentiment Overview */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Sentiment Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <StatsCard
              title="Overall Score"
              value="8.2"
              subtitle="Out of 10"
              icon="😊"
              color="#4caf50"
              trend={{ value: 5.1, isPositive: true }}
            />
            <StatsCard
              title="Positive Feedback"
              value="76%"
              subtitle="Last 30 days"
              icon="👍"
              color="#4caf50"
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              title="Negative Alerts"
              value="3"
              subtitle="Requiring attention"
              icon="⚠️"
              color="#f44336"
            />
            <StatsCard
              title="Response Rate"
              value="94%"
              subtitle="Issues addressed"
              icon="💬"
              color="#2196f3"
              trend={{ value: 2.8, isPositive: true }}
            />
          </View>
        </View>

        {/* Recent Feedback */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Feedback Analysis
          </Text>
          
          {recentFeedback.map((feedback) => (
            <Card key={feedback.id} style={[
              styles.feedbackCard, 
              feedback.actionRequired && styles.actionRequiredCard
            ]}>
              <Card.Content>
                <View style={styles.feedbackHeader}>
                  <View style={styles.feedbackInfo}>
                    <Text variant="titleMedium" style={styles.clientName}>
                      {feedback.client}
                    </Text>
                    <Text variant="bodySmall" style={styles.feedbackDate}>
                      {feedback.date}
                    </Text>
                  </View>
                  <View style={styles.sentimentBadge}>
                    <Chip 
                      style={[styles.sentimentChip, { 
                        backgroundColor: getSentimentColor(feedback.sentiment.classification) 
                      }]}
                      textStyle={{ color: 'white', fontWeight: '600' }}
                    >
                      {getSentimentIcon(feedback.sentiment.classification)} {feedback.sentiment.classification}
                    </Chip>
                  </View>
                </View>
                
                <Text variant="bodyMedium" style={styles.feedbackContent}>
                  "{feedback.content}"
                </Text>
                
                <View style={styles.topicsContainer}>
                  <Text variant="bodySmall" style={styles.topicsLabel}>
                    Topics:
                  </Text>
                  <View style={styles.topicsList}>
                    {feedback.topics.map((topic, index) => (
                      <Chip key={index} mode="outlined" style={styles.topicChip}>
                        {topic}
                      </Chip>
                    ))}
                  </View>
                </View>

                {feedback.actionRequired && (
                  <View style={styles.actionRequired}>
                    <Text variant="bodySmall" style={styles.actionText}>
                      🚨 Action Required: Follow up with customer
                    </Text>
                  </View>
                )}
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
                This is a placeholder implementation showing mock sentiment analysis.
              </Text>
              <Text variant="bodySmall" style={styles.statusSubtext}>
                The actual sentiment analysis engine will be implemented in Phase 1, featuring:
              </Text>
              
              <View style={styles.featuresList}>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Real-time sentiment scoring
                </Text>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Topic extraction and clustering
                </Text>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Emotion detection and analysis
                </Text>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Automated alert generation
                </Text>
                <Text variant="bodySmall" style={styles.featureItem}>
                  • Trend analysis and reporting
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
  feedbackCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  actionRequiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackInfo: {
    flex: 1,
  },
  clientName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  feedbackDate: {
    color: '#666',
    marginTop: 4,
  },
  sentimentBadge: {
    marginLeft: 12,
  },
  sentimentChip: {
    borderRadius: 16,
  },
  feedbackContent: {
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  topicsContainer: {
    marginTop: 8,
  },
  topicsLabel: {
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicChip: {
    marginBottom: 4,
  },
  actionRequired: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  actionText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  statusTitle: {
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    color: '#388e3c',
    marginBottom: 8,
  },
  statusSubtext: {
    color: '#4caf50',
    marginBottom: 12,
  },
  featuresList: {
    gap: 4,
  },
  featureItem: {
    color: '#4caf50',
    fontSize: 12,
  },
});