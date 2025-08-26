
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function JobDetail({ route }:any){
  const { job } = route.params;
  return (
    <View style={{flex:1, padding:16}}>
      <Text variant="titleLarge">{job.title}</Text>
      <Text>{job.description}</Text>
      <Text>{job.address}</Text>
    </View>
  );
}
