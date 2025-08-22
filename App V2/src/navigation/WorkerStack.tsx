
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkerHome from '../screens/worker/Home';
import Jobs from '../screens/worker/Jobs';
import JobDetail from '../screens/worker/JobDetail';
import Earnings from '../screens/worker/Earnings';
import ClockInOut from '../screens/worker/ClockInOut';
import Photos from '../screens/worker/Photos';
import Miles from '../screens/worker/Miles';

const Stack = createNativeStackNavigator();

export default function WorkerStack(){
  return (
    <Stack.Navigator>
      <Stack.Screen name="WorkerHome" component={WorkerHome} options={{title:'Home'}}/>
      <Stack.Screen name="Jobs" component={Jobs} />
      <Stack.Screen name="JobDetail" component={JobDetail} />
      <Stack.Screen name="Earnings" component={Earnings} />
      <Stack.Screen name="ClockInOut" component={ClockInOut} />
      <Stack.Screen name="Photos" component={Photos} />
      <Stack.Screen name="Miles" component={Miles} />
    </Stack.Navigator>
  )
}
