
import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function ClientHome({ navigation }:any){
  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="headlineMedium">Client</Text>
      <Button onPress={()=>navigation.navigate('RequestService')}>Submit Request</Button>
      <Button onPress={()=>navigation.navigate('ScheduleEstimate')}>Schedule Estimate</Button>
      <Button onPress={()=>navigation.navigate('JobStatus')}>Job Status</Button>
      <Button onPress={()=>navigation.navigate('SpendAndSave')}>Spend & Save</Button>
      <Button onPress={()=>navigation.navigate('ServicesAndPricing')}>Services & Pricing</Button>
      <Button onPress={()=>navigation.navigate('DealsAndOffers')}>Deals & Offers</Button>
      <Button onPress={()=>navigation.navigate('Referrals')}>Referrals</Button>
      <Button onPress={()=>navigation.navigate('Reviews')}>Submit Review</Button>
      <Button onPress={()=>navigation.navigate('Contact')}>Contact</Button>
    </View>
  );
}
