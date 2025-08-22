
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Signup({ navigation }:any){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');
  const [busy,setBusy] = useState(false);

  const signup = async ()=>{
    try{
      setBusy(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db,'users', cred.user.uid), { name, email, role: 'client', createdAt: Date.now() });
      navigation.replace('RoleSelect');
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  return (
    <View style={{flex:1, padding:16, gap:12, justifyContent:'center'}}>
      <Text variant="headlineMedium">Create account</Text>
      <TextInput label="Name" value={name} onChangeText={setName} />
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize='none'/>
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button mode="contained" onPress={signup} loading={busy}>Sign up</Button>
    </View>
  )
}
