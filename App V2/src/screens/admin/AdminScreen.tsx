import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AdminTabs from './AdminTabs';

export default function AdminScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Admin Dashboard" titleStyle={styles.title} />
        <Appbar.Action 
          icon="bell-outline" 
          iconColor="#19a974"
          onPress={() => navigation.navigate('Notifications' as never)} 
        />
        <Appbar.Action 
          icon="cog-outline" 
          iconColor="#19a974"
          onPress={() => navigation.navigate('Settings' as never)} 
        />
      </Appbar.Header>
      <AdminTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
});