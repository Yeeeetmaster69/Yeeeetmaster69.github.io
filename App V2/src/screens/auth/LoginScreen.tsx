
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function Login({ navigation }:any){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [busy,setBusy] = useState(false);

  const login = async ()=>{
    try{
      setBusy(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  return (
    <View style={{flex:1, padding:16, gap:12, justifyContent:'center'}}>
      <Text variant="headlineMedium">Welcome back</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize='none'/>
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button mode="contained" onPress={login} loading={busy}>Login</Button>
      <Button onPress={()=>navigation.navigate('Signup')}>Create account</Button>
    </View>
  )
}
