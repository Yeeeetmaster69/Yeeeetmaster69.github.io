import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function IncomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Income</Text>
      <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
        Track and analyze income data from this tab.
      </Text>
    </View>
  );
}