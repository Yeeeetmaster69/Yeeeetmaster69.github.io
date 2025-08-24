import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DashboardTab from './tabs/DashboardTab';
import JobsTab from './tabs/JobsTab';
import ClientsTab from './tabs/ClientsTab';
import WorkersTab from './tabs/WorkersTab';
import SafetyTab from './tabs/SafetyTab';
import AIAssistantTab from './tabs/AIAssistantTab';

const Tab = createMaterialTopTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#19a974',
        tabBarInactiveTintColor: '#98bfa7',
        tabBarStyle: {
          backgroundColor: '#fff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#19a974',
          height: 3,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen 
        name="Overview" 
        component={DashboardTab}
        options={{ tabBarLabel: 'Overview' }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobsTab}
        options={{ tabBarLabel: 'Jobs' }}
      />
      <Tab.Screen 
        name="Clients" 
        component={ClientsTab}
        options={{ tabBarLabel: 'Clients' }}
      />
      <Tab.Screen 
        name="Workers" 
        component={WorkersTab}
        options={{ tabBarLabel: 'Workers' }}
      />
      <Tab.Screen 
        name="Safety" 
        component={SafetyTab}
        options={{ tabBarLabel: 'Safety' }}
      />
      <Tab.Screen 
        name="AI" 
        component={AIAssistantTab}
        options={{ tabBarLabel: 'AI' }}
      />
    </Tab.Navigator>
  );
}