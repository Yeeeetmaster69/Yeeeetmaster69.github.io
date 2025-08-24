
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from '../screens/admin/AdminScreen';
import Users from '../screens/admin/Users';
import AdminJobs from '../screens/admin/Jobs';
import Pricing from '../screens/admin/Pricing';
import Payroll from '../screens/admin/Payroll';
import Estimates from '../screens/admin/Estimates';
import Invoices from '../screens/admin/Invoices';
import Notifications from '../screens/admin/Notifications';
import Settings from '../screens/admin/Settings';

const Stack = createNativeStackNavigator();

export default function AdminStack(){
  return (
    <Stack.Navigator>
      <Stack.Screen name="Admin" component={AdminScreen} options={{title:'Admin'}} />
      <Stack.Screen name="Users" component={Users} />
      <Stack.Screen name="AdminJobs" component={AdminJobs} options={{title:'Jobs'}}/>
      <Stack.Screen name="Pricing" component={Pricing} />
      <Stack.Screen name="Payroll" component={Payroll} />
      <Stack.Screen name="Estimates" component={Estimates} />
      <Stack.Screen name="Invoices" component={Invoices} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  )
}
