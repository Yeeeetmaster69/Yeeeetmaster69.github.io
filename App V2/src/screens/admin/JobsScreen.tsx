import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function JobsScreen() {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Jobs</Text>
      <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
        Manage and track all jobs from this tab.
      </Text>
    </View>
  );
}