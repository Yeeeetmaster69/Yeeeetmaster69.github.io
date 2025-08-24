import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import JobsScreen from './JobsScreen';
import ClientsScreen from './ClientsScreen';
import WorkersScreen from './WorkersScreen';
import IncomeScreen from './IncomeScreen';

const Tab = createMaterialTopTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#19a974',
        tabBarInactiveTintColor: '#98bfa7',
        tabBarStyle: {
          backgroundColor: '#0f1a0f',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#19a974',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Workers" component={WorkersScreen} />
      <Tab.Screen name="Income" component={IncomeScreen} />
    </Tab.Navigator>
  );
}