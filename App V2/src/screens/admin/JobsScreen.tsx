import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function JobsScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Jobs</Text>
      <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center', marginBottom: 24 }}>
        Manage and track all jobs from this tab.
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('AdminJobs' as never)}
        style={{ marginTop: 16 }}
      >
        Go to Jobs Management
      </Button>
    </View>
  );
}