
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { functionUrl } from '../../config/env';

export default function Notifications(){
  const [msg,setMsg] = useState('');
  const send = async ()=>{
    await fetch(functionUrl('broadcast'), {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: msg })
    });
    alert('Sent');
  };
  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <TextInput label="Message" value={msg} onChangeText={setMsg} multiline />
      <Button mode="contained" onPress={send}>Send Push to All</Button>
    </View>
  );
}
