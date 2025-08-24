import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip, Surface, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface AIFeature {
  name: string;
  description: string;
  icon: string;
  status: 'coming_soon' | 'prototype' | 'beta' | 'active';
  estimatedBenefit: string;
}

export default function AIAssistantTab() {
  const navigation = useNavigation();
  const [features] = useState<AIFeature[]>([
    {
      name: 'Smart Job Routing',
      description: 'Automatically assign jobs to the best available workers based on skills, location, and availability.',
      icon: 'map-marker-path',
      status: 'coming_soon',
      estimatedBenefit: '+20% efficiency'
    },
    {
      name: 'Predictive Scheduling',
      description: 'Suggest optimal scheduling times using historical data, weather, and traffic patterns.',
      icon: 'calendar-clock',
      status: 'coming_soon',
      estimatedBenefit: '+30% accuracy'
    },
    {
      name: 'Automated Quoting',
      description: 'Generate quotes from photos and descriptions using AI image analysis.',
      icon: 'camera-enhance',
      status: 'coming_soon',
      estimatedBenefit: '+90% faster'
    },
    {
      name: 'AI Chatbot Support',
      description: '24/7 automated support for common questions and scheduling assistance.',
      icon: 'chat-processing',
      status: 'prototype',
      estimatedBenefit: '+70% resolution'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'beta': return '#ff9800';
      case 'prototype': return '#2196f3';
      case 'coming_soon': return '#9e9e9e';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'beta': return 'Beta';
      case 'prototype': return 'Prototype';
      case 'coming_soon': return 'Coming Soon';
      default: return 'Unknown';
    }
  };

  const handleFeaturePress = (feature: AIFeature) => {
    if (feature.status === 'prototype' && feature.name === 'AI Chatbot Support') {
      // Navigate to a simple chatbot prototype
      // For now, just show info
      navigation.navigate('Notifications' as never);
    } else {
      // Show info about the feature
      console.log(`Feature ${feature.name} is ${feature.status}`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="titleLarge" style={styles.title}>
          AI Assistant & Automation
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Intelligent features to streamline your handyman business
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            AI Features Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content>
                <View style={styles.statContent}>
                  <Icon source="robot" size={24} color="#19a974" />
                  <Text variant="bodyLarge" style={styles.statValue}>4</Text>
                </View>
                <Text variant="bodySmall" style={styles.statLabel}>Planned Features</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content>
                <View style={styles.statContent}>
                  <Icon source="trending-up" size={24} color="#19a974" />
                  <Text variant="bodyLarge" style={styles.statValue}>+50%</Text>
                </View>
                <Text variant="bodySmall" style={styles.statLabel}>Est. Efficiency</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* AI Features */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Available AI Features
          </Text>
          
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Card.Content>
                <View style={styles.featureHeader}>
                  <View style={styles.featureTitle}>
                    <Icon source={feature.icon} size={24} color="#19a974" />
                    <Text variant="titleMedium" style={styles.featureName}>
                      {feature.name}
                    </Text>
                  </View>
                  <View style={styles.featureBadges}>
                    <Chip
                      mode="outlined"
                      textStyle={{ color: getStatusColor(feature.status), fontSize: 12 }}
                      style={[styles.statusChip, { borderColor: getStatusColor(feature.status) }]}
                    >
                      {getStatusLabel(feature.status)}
                    </Chip>
                    <Chip
                      mode="outlined"
                      textStyle={{ color: '#19a974', fontSize: 12 }}
                      style={[styles.benefitChip, { borderColor: '#19a974' }]}
                    >
                      {feature.estimatedBenefit}
                    </Chip>
                  </View>
                </View>
                
                <Text variant="bodyMedium" style={styles.featureDescription}>
                  {feature.description}
                </Text>
                
                <View style={styles.featureActions}>
                  {feature.status === 'prototype' ? (
                    <Button 
                      mode="contained" 
                      onPress={() => handleFeaturePress(feature)}
                      style={styles.actionButton}
                      buttonColor="#19a974"
                    >
                      Try Prototype
                    </Button>
                  ) : feature.status === 'coming_soon' ? (
                    <Button 
                      mode="outlined" 
                      disabled
                      style={styles.actionButton}
                    >
                      Coming Soon
                    </Button>
                  ) : (
                    <Button 
                      mode="contained" 
                      onPress={() => handleFeaturePress(feature)}
                      style={styles.actionButton}
                      buttonColor="#19a974"
                    >
                      Use Feature
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Development Status */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Development Roadmap
          </Text>
          
          <Card style={styles.roadmapCard}>
            <Card.Content>
              <View style={styles.roadmapItem}>
                <View style={styles.roadmapPhase}>
                  <Text variant="labelLarge" style={styles.phaseTitle}>Phase 1: Foundation</Text>
                  <Text variant="bodySmall" style={styles.phaseStatus}>Planning</Text>
                </View>
                <Text variant="bodyMedium" style={styles.phaseDescription}>
                  Set up AI infrastructure, data collection, and basic routing algorithms
                </Text>
              </View>
              
              <View style={styles.roadmapItem}>
                <View style={styles.roadmapPhase}>
                  <Text variant="labelLarge" style={styles.phaseTitle}>Phase 2: Core Features</Text>
                  <Text variant="bodySmall" style={styles.phaseStatus}>In Design</Text>
                </View>
                <Text variant="bodyMedium" style={styles.phaseDescription}>
                  Implement Smart Job Routing, Predictive Scheduling, and Automated Quoting
                </Text>
              </View>
              
              <View style={styles.roadmapItem}>
                <View style={styles.roadmapPhase}>
                  <Text variant="labelLarge" style={styles.phaseTitle}>Phase 3: Enhancement</Text>
                  <Text variant="bodySmall" style={styles.phaseStatus}>Future</Text>
                </View>
                <Text variant="bodyMedium" style={styles.phaseDescription}>
                  Machine learning optimization, advanced chatbot, and performance analytics
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Get Started
          </Text>
          
          <View style={styles.quickActions}>
            <Button 
              mode="outlined" 
              onPress={() => console.log('View AI Documentation')}
              style={styles.quickActionButton}
              icon="book-open-variant"
            >
              View Documentation
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => console.log('Request AI Features')}
              style={styles.quickActionButton}
              icon="lightbulb-on"
            >
              Request Features
            </Button>
          </View>
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
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontWeight: '700',
    color: '#19a974',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  featureCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  featureHeader: {
    marginBottom: 12,
  },
  featureTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureName: {
    fontWeight: '600',
    marginLeft: 12,
  },
  featureBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  benefitChip: {
    height: 24,
  },
  featureDescription: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    // Style for action buttons
  },
  roadmapCard: {
    backgroundColor: 'white',
  },
  roadmapItem: {
    marginBottom: 16,
  },
  roadmapPhase: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  phaseTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  phaseStatus: {
    color: '#19a974',
    fontSize: 12,
  },
  phaseDescription: {
    color: '#666',
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
});