import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function WorkersScreen() {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Workers</Text>
      <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
        Manage worker information and assignments from this tab.
      </Text>
    </View>
  );
}