import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function ClientsScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Clients</Text>
      <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center', marginBottom: 24 }}>
        Manage client information and relationships from this tab.
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Users' as never)}
        style={{ marginTop: 16 }}
      >
        Go to User Management
      </Button>
    </View>
  );
}