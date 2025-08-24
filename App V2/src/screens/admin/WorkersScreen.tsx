import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function WorkersScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Workers</Text>
      <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center', marginBottom: 24 }}>
        Manage worker information and assignments from this tab.
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Payroll' as never)}
        style={{ marginTop: 16 }}
      >
        Go to Payroll Management
      </Button>
    </View>
  );
}