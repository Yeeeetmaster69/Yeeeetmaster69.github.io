import React from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AdminTabs from './AdminTabs';

export default function AdminScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Admin" />
        <Appbar.Action 
          icon="bell" 
          onPress={() => navigation.navigate('Notifications' as never)} 
        />
        <Appbar.Action 
          icon="cog" 
          onPress={() => navigation.navigate('Settings' as never)} 
        />
      </Appbar.Header>
      <AdminTabs />
    </View>
  );
}