
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from '../screens/admin/AdminScreen';
import Users from '../screens/admin/Users';
import AdminJobs from '../screens/admin/Jobs';
import AdminClients from '../screens/admin/Clients';
import AdminWorkers from '../screens/admin/Workers';
import AdminIncome from '../screens/admin/Income';
import AdminReferences from '../screens/admin/References';
import Pricing from '../screens/admin/Pricing';
import Payroll from '../screens/admin/Payroll';
import Estimates from '../screens/admin/Estimates';
import Invoices from '../screens/admin/Invoices';
import Notifications from '../screens/admin/Notifications';
import Settings from '../screens/admin/Settings';

import { AnalyticsDashboard, ChurnDashboard, SentimentDashboard } from '../screens/admin/analytics';


const Stack = createNativeStackNavigator();

export default function AdminStack(){
  return (
    <Stack.Navigator>
      <Stack.Screen name="Admin" component={AdminScreen} options={{title:'Admin'}} />
      <Stack.Screen name="Users" component={Users} />
      <Stack.Screen name="AdminJobs" component={AdminJobs} options={{title:'Jobs'}}/>
      <Stack.Screen name="Clients" component={AdminClients} />
      <Stack.Screen name="Workers" component={AdminWorkers} />
      <Stack.Screen name="Income" component={AdminIncome} />
      <Stack.Screen name="References" component={AdminReferences} />
      <Stack.Screen name="Pricing" component={Pricing} />
      <Stack.Screen name="Payroll" component={Payroll} />
      <Stack.Screen name="Estimates" component={Estimates} />
      <Stack.Screen name="Invoices" component={Invoices} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Settings" component={Settings} />

      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboard} options={{title:'Data Insights'}}/>
      <Stack.Screen name="ChurnDashboard" component={ChurnDashboard} options={{title:'Churn Prediction'}}/>
      <Stack.Screen name="SentimentDashboard" component={SentimentDashboard} options={{title:'Sentiment Analysis'}}/>

    </Stack.Navigator>
  )
}
