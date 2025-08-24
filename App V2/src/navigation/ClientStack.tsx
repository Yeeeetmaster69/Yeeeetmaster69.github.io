
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientHome from '../screens/client/Home';
import RequestService from '../screens/client/RequestService';
import ScheduleEstimate from '../screens/client/ScheduleEstimate';
import JobStatus from '../screens/client/JobStatus';
import SpendAndSave from '../screens/client/SpendAndSave';
import Reviews from '../screens/client/Reviews';
import ServicesAndPricing from '../screens/client/ServicesAndPricing';
import DealsAndOffers from '../screens/client/DealsAndOffers';
import Referrals from '../screens/client/Referrals';
import Contact from '../screens/client/Contact';
import PaymentOptions from '../screens/client/PaymentOptions';
import Chat from '../screens/client/Chat';

const Stack = createNativeStackNavigator();

export default function ClientStack(){
  return (
    <Stack.Navigator>
      <Stack.Screen name="ClientHome" component={ClientHome} options={{title:'Home'}}/>
      <Stack.Screen name="RequestService" component={RequestService} />
      <Stack.Screen name="ScheduleEstimate" component={ScheduleEstimate} />
      <Stack.Screen name="JobStatus" component={JobStatus} />
      <Stack.Screen name="SpendAndSave" component={SpendAndSave} />
      <Stack.Screen name="Reviews" component={Reviews} />
      <Stack.Screen name="ServicesAndPricing" component={ServicesAndPricing} />
      <Stack.Screen name="DealsAndOffers" component={DealsAndOffers} />
      <Stack.Screen name="Referrals" component={Referrals} />
      <Stack.Screen name="Contact" component={Contact} />
      <Stack.Screen name="PaymentOptions" component={PaymentOptions} />
      <Stack.Screen name="Chat" component={Chat} options={{title:'Support Chat'}} />
    </Stack.Navigator>
  )
}
