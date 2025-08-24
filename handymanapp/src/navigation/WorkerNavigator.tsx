import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Worker Screens
import WorkerDashboard from '../screens/worker/WorkerDashboard';
import WorkerJobs from '../screens/worker/WorkerJobs';
import ClockInOut from '../screens/worker/ClockInOut';
import WorkerProfile from '../screens/worker/WorkerProfile';
import JobDetails from '../screens/shared/JobDetails';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function WorkerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'help';
          
          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Jobs':
              iconName = 'work';
              break;
            case 'Clock':
              iconName = 'access-time';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }
          
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={WorkerDashboard} />
      <Tab.Screen name="Jobs" component={WorkerJobs} />
      <Tab.Screen name="Clock" component={ClockInOut} />
      <Tab.Screen name="Profile" component={WorkerProfile} />
    </Tab.Navigator>
  );
}

export default function WorkerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="WorkerTabs" 
        component={WorkerTabs} 
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