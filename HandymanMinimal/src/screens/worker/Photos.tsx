
import React, { useState } from 'react';
import { View, Platform, Alert } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { auth } from '../../config/firebase';

export default function Photos(){
  const [jobId,setJobId] = useState('');

  const pickAndUpload = async (kind:'before'|'after')=>{
    // Image picker functionality - available in full version
    Alert.alert('Photo Upload', `${kind} photo upload feature - Available in full version!`);
  }

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <TextInput label="Job ID" value={jobId} onChangeText={setJobId} />
      <Button mode="contained" onPress={()=>pickAndUpload('before')} disabled={!jobId}>Upload Before</Button>
      <Button mode="contained" onPress={()=>pickAndUpload('after')} disabled={!jobId}>Upload After</Button>
    </View>
  );
}
