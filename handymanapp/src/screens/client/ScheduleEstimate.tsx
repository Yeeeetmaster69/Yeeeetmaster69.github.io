
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function ScheduleEstimate(){
  const [when,setWhen] = useState('');
  const [address,setAddress] = useState('');
  const save = async ()=>{
    await addDoc(collection(db,'estimates'), { when, address, createdAt: Date.now() });
    alert('Estimate requested');
  };
  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="titleLarge">Schedule Estimate</Text>
      <TextInput label="Preferred Date/Time" value={when} onChangeText={setWhen} />
      <TextInput label="Address" value={address} onChangeText={setAddress} />
      <Button mode="contained" onPress={save}>Request</Button>
    </View>
  );
}
