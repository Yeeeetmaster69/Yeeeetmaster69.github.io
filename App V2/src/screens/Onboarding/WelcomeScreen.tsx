import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Surface style={styles.content} elevation={2}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🔧</Text>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome to Handyman Pro
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Your complete solution for handyman services
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text variant="bodyMedium" style={styles.featureText}>
              Easy job management & communication
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💳</Text>
            <Text variant="bodyMedium" style={styles.featureText}>
              Secure payments & invoicing
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text variant="bodyMedium" style={styles.featureText}>
              GPS tracking & time management
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text variant="bodyMedium" style={styles.featureText}>
              Reviews & quality assurance
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('RoleSelection')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
          
          <Text variant="bodySmall" style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
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
    padding: 32,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  featureText: {
    flex: 1,
    color: '#333',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  disclaimer: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
  },
});