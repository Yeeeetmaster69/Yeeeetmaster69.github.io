
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { db } from '../../config/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function RequestService(){
  const [desc,setDesc] = useState('');
  const [addr,setAddr] = useState('');
  const submit = async ()=>{
    await addDoc(collection(db,'requests'), { desc, addr, createdAt: Date.now() });
    alert('Request submitted');
    setDesc(''); setAddr('');
  };
  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="titleLarge">Submit Request</Text>
      <TextInput label="Description" value={desc} onChangeText={setDesc} multiline />
      <TextInput label="Address" value={addr} onChangeText={setAddr} />
      <Button mode="contained" onPress={submit}>Submit</Button>
    </View>
  );
}
