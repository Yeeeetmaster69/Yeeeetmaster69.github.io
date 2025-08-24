import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Client Screens
import ClientDashboard from '../screens/client/ClientDashboard';
import RequestJob from '../screens/client/RequestJob';
import ClientJobs from '../screens/client/ClientJobs';
import ClientProfile from '../screens/client/ClientProfile';
import JobDetails from '../screens/shared/JobDetails';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'help';
          
          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Request':
              iconName = 'add-circle';
              break;
            case 'Jobs':
              iconName = 'work';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }
          
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={ClientDashboard} />
      <Tab.Screen name="Request" component={RequestJob} />
      <Tab.Screen name="Jobs" component={ClientJobs} />
      <Tab.Screen name="Profile" component={ClientProfile} />
    </Tab.Navigator>
  );
}

export default function ClientNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ClientTabs" 
        component={ClientTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="JobDetails" 
        component={JobDetails}
        options={{ title: 'Job Details' }}
      />
    </Stack.Navigator>
  );
}