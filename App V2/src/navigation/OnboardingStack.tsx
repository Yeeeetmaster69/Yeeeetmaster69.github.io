import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import RoleSelectionScreen from '../screens/Onboarding/RoleSelectionScreen';
import PermissionsScreen from '../screens/Onboarding/PermissionsScreen';
import FeaturesOverviewScreen from '../screens/Onboarding/FeaturesOverviewScreen';
import CompletionScreen from '../screens/Onboarding/CompletionScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  RoleSelection: undefined;
  Permissions: undefined;
  FeaturesOverview: { role: 'client' | 'worker' | 'admin' };
  Completion: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="FeaturesOverview" component={FeaturesOverviewScreen} />
      <Stack.Screen name="Completion" component={CompletionScreen} />
    </Stack.Navigator>
  );
}