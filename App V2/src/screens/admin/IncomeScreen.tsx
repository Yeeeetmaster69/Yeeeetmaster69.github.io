import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function IncomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Income</Text>
      <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center', marginBottom: 24 }}>
        Track and analyze income data from this tab.
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Estimates' as never)}
        >
          Estimates
        </Button>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Invoices' as never)}
        >
          Invoices
        </Button>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Pricing' as never)}
        >
          Pricing
        </Button>
      </View>
    </View>
  );
}