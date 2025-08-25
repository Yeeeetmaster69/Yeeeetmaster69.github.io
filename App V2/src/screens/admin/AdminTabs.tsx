import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import JobsScreen from './JobsScreen';
import ClientsScreen from './ClientsScreen';
import WorkersScreen from './WorkersScreen';
import IncomeScreen from './IncomeScreen';
import SubscriptionPlans from './SubscriptionPlans';
import ClientSubscriptionManagement from './ClientSubscriptionManagement';

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
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Workers" component={WorkersScreen} />
      <Tab.Screen name="Income" component={IncomeScreen} />
      <Tab.Screen name="Plans" component={SubscriptionPlans} />
      <Tab.Screen name="Subscriptions" component={ClientSubscriptionManagement} />
    </Tab.Navigator>
  );
}