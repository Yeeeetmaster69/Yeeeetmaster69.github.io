import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/env';

// Auth screens
import AuthStack from './AuthStack';

// Main role-based stacks
import ClientStack from './ClientStack';
import WorkerStack from './WorkerStack';
import AdminStack from './AdminStack';

// Onboarding screens
import OnboardingStack from './OnboardingStack';

// Loading component
import { ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <ActivityIndicator size="large" />
    <Text>Loading...</Text>
  </View>
);

export default function RoleBasedNavigator() {
  const { user, loading, isOnboardingComplete, hasSelectedRole } = useAuth();

  // Show loading screen while authentication is being determined
  if (loading) {
    return <LoadingScreen />;
  }

  // If no user, show auth stack
  if (!user) {
    return <AuthStack />;
  }

  // If onboarding is enabled and not complete, show onboarding
  if (APP_CONFIG.features.enableOnboarding && !isOnboardingComplete) {
    return <OnboardingStack />;
  }

  // If user hasn't selected a role yet, keep them on role selection
  if (!hasSelectedRole || !user.role) {
    return <AuthStack />;
  }

  // Route to appropriate stack based on role
  switch (user.role) {
    case 'admin':
      return <AdminStack />;
    case 'worker':
      return <WorkerStack />;
    case 'client':
    default:
      return <ClientStack />;
  }
}