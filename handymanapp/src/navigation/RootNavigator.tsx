
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import ClientStack from './ClientStack';
import WorkerStack from './WorkerStack';
import AdminStack from './AdminStack';
import useAuth from '../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function RootNavigator(){
  const { user, claims, loading } = useAuth();
  if (loading) return <View style={{flex:1, alignItems:'center', justifyContent:'center'}}><ActivityIndicator /></View>;
  if (!user) return <AuthStack />;
  if (claims.role === 'admin') return <AdminStack />;
  if (claims.role === 'worker') return <WorkerStack />;
  return <ClientStack />;
}
