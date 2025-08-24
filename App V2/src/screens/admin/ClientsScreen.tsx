import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ClientsScreen() {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Clients</Text>
      <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
        Manage client information and relationships from this tab.
      </Text>
    </View>
  );
}