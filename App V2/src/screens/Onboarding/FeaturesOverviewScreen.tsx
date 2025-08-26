import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Button, Surface, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp as RouteType } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'FeaturesOverview'>;
type RouteProps = RouteType<OnboardingStackParamList, 'FeaturesOverview'>;

const { width } = Dimensions.get('window');

export default function FeaturesOverviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { role } = route.params;

  const roleFeatures = {
    client: {
      title: 'Client Features',
      icon: '🏠',
      features: [
        {
          title: 'Request Services',
          description: 'Easily request handyman services with detailed job descriptions',
          icon: '📝',
        },
        {
          title: 'Track Progress',
          description: 'Real-time updates on job status and worker location',
          icon: '📍',
        },
        {
          title: 'Secure Payments',
          description: 'Pay securely through the app with multiple payment options',
          icon: '💳',
        },
        {
          title: 'Rate & Review',
          description: 'Leave feedback to help maintain service quality',
          icon: '⭐',
        },
        {
          title: 'Chat Support',
          description: 'Direct communication with your assigned worker',
          icon: '💬',
        },
      ]
    },
    worker: {
      title: 'Worker Features',
      icon: '🔧',
      features: [
        {
          title: 'Find Jobs',
          description: 'Browse and claim available jobs in your area',
          icon: '🔍',
        },
        {
          title: 'GPS Time Tracking',
          description: 'Automatic time tracking with location verification',
          icon: '⏱️',
        },
        {
          title: 'Photo Documentation',
          description: 'Upload before/after photos for quality assurance',
          icon: '📸',
        },
        {
          title: 'Earnings Dashboard',
          description: 'Track your income and payment history',
          icon: '💰',
        },
        {
          title: 'Route Optimization',
          description: 'Get the best routes between job locations',
          icon: '🗺️',
        },
      ]
    },
    admin: {
      title: 'Admin Features',
      icon: '⚙️',
      features: [
        {
          title: 'User Management',
          description: 'Manage workers, clients, and role assignments',
          icon: '👥',
        },
        {
          title: 'Analytics Dashboard',
          description: 'Comprehensive business metrics and insights',
          icon: '📊',
        },
        {
          title: 'Quality Control',
          description: 'Monitor service quality and resolve issues',
          icon: '🎯',
        },
        {
          title: 'Payment Processing',
          description: 'Handle invoicing, payments, and financial reporting',
          icon: '💼',
        },
        {
          title: 'System Configuration',
          description: 'Customize app settings and business rules',
          icon: '⚙️',
        },
      ]
    }
  };

  const currentRole = roleFeatures[role];

  return (
    <View style={styles.container}>
      <Surface style={styles.content} elevation={2}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.roleIcon}>{currentRole.icon}</Text>
            <Text variant="headlineMedium" style={styles.title}>
              {currentRole.title}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Here's what you can do with Handyman Pro
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            {currentRole.features.map((feature, index) => (
              <Card key={index} style={styles.featureCard}>
                <Card.Content style={styles.featureContent}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                    <Text variant="titleMedium" style={styles.featureTitle}>
                      {feature.title}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Completion')}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Start Using Handyman Pro
            </Button>
          </View>
        </ScrollView>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: '90%',
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureCard: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  featureContent: {
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  featureDescription: {
    color: '#666',
    lineHeight: 16,
    marginLeft: 36,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});