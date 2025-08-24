import React from 'react';
import { View } from 'react-native';
import AdminTabs from './AdminTabs';

export default function AdminScreen() {
  return (
    <View style={{ flex: 1 }}>
      <AdminTabs />
    </View>
  );
}