import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Surface, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { functionUrl } from '../../config/env';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'RoleSelection'>;

const { width } = Dimensions.get('window');

type Role = 'client' | 'worker' | 'admin';

export default function RoleSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, setHasSelectedRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('client');
  const [loading, setLoading] = useState(false);

  const roleDescriptions = {
    client: {
      title: 'I need services',
      description: 'Request handyman services, manage appointments, and track job progress',
      icon: '🏠',
      features: ['Request services', 'Track jobs', 'Pay securely', 'Leave reviews']
    },
    worker: {
      title: 'I provide services',
      description: 'Find jobs, manage your schedule, and grow your handyman business',
      icon: '🔧',
      features: ['Find jobs', 'Track time & location', 'Upload photos', 'Manage earnings']
    },
    admin: {
      title: 'I manage the platform',
      description: 'Oversee operations, manage users, and monitor business metrics',
      icon: '⚙️',
      features: ['Manage users', 'Business analytics', 'Quality control', 'Payment processing']
    }
  };

  const handleRoleSelection = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update user role in Firestore
      await updateDoc(doc(db, 'users', user.uid), { role: selectedRole });
      
      // Call cloud function to set custom claims
      await fetch(functionUrl('setRoleClaim'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, role: selectedRole })
      });

      // Mark role as selected
      await setHasSelectedRole(true);
      
      // Navigate to permissions screen
      navigation.navigate('Permissions');
    } catch (error) {
      console.error('Error setting role:', error);
      // Still navigate to show the role selection worked locally
      navigation.navigate('Permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.content} elevation={2}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Choose Your Role
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Select how you'll use Handyman Pro
          </Text>
        </View>

        <RadioButton.Group 
          onValueChange={value => setSelectedRole(value as Role)} 
          value={selectedRole}
        >
          {(Object.keys(roleDescriptions) as Role[]).map((role) => {
            const info = roleDescriptions[role];
            return (
              <Surface key={role} style={styles.roleCard} elevation={1}>
                <View style={styles.roleContent}>
                  <View style={styles.roleHeader}>
                    <Text style={styles.roleIcon}>{info.icon}</Text>
                    <View style={styles.roleInfo}>
                      <Text variant="titleMedium" style={styles.roleTitle}>
                        {info.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.roleDescription}>
                        {info.description}
                      </Text>
                    </View>
                    <RadioButton value={role} />
                  </View>
                  
                  <View style={styles.featuresContainer}>
                    {info.features.map((feature, index) => (
                      <Text key={index} variant="bodySmall" style={styles.feature}>
                        • {feature}
                      </Text>
                    ))}
                  </View>
                </View>
              </Surface>
            );
          })}
        </RadioButton.Group>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleRoleSelection}
            style={styles.button}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading}
          >
            Continue as {roleDescriptions[selectedRole].title.toLowerCase()}
          </Button>
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
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  roleCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  roleContent: {
    padding: 16,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleDescription: {
    color: '#666',
    lineHeight: 16,
  },
  featuresContainer: {
    paddingLeft: 44,
  },
  feature: {
    color: '#888',
    marginBottom: 2,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});