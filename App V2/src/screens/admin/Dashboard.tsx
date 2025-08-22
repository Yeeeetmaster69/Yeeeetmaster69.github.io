
import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function Dashboard({ navigation }:any){
  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="headlineMedium">Admin</Text>
      <Button onPress={()=>navigation.navigate('Users')}>Manage Users</Button>
      <Button onPress={()=>navigation.navigate('AdminJobs')}>Jobs</Button>
      <Button onPress={()=>navigation.navigate('Pricing')}>Pricing</Button>
      <Button onPress={()=>navigation.navigate('Payroll')}>Payroll</Button>
      <Button onPress={()=>navigation.navigate('Estimates')}>Estimates</Button>
      <Button onPress={()=>navigation.navigate('Invoices')}>Invoices</Button>
      <Button onPress={()=>navigation.navigate('Notifications')}>Push Messages</Button>
      <Button onPress={()=>navigation.navigate('Settings')}>Settings</Button>
    </View>
  );
}
