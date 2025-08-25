
import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function WorkerHome({ navigation }:any){
  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="headlineMedium">Worker</Text>
      <Button onPress={()=>navigation.navigate('Jobs')}>Jobs</Button>
      <Button onPress={()=>navigation.navigate('Earnings')}>Earnings</Button>
      <Button onPress={()=>navigation.navigate('ClockInOut')}>Clock In/Out</Button>
      <Button onPress={()=>navigation.navigate('Photos')}>Add Photos</Button>
      <Button onPress={()=>navigation.navigate('Miles')}>Miles</Button>
    </View>
  );
}
