
import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from '../../services/storage';
import { auth } from '../../config/firebase';

export default function Photos(){
  const [jobId,setJobId] = useState('');

  const pickAndUpload = async (kind:'before'|'after')=>{
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (res.canceled) return;
    const asset = res.assets[0];
    const resp = await fetch(asset.uri);
    const blob = await resp.blob();
    const url = await uploadPhoto(auth.currentUser!.uid, jobId, blob, kind);
    alert('Uploaded: '+url);
  }

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <TextInput label="Job ID" value={jobId} onChangeText={setJobId} />
      <Button mode="contained" onPress={()=>pickAndUpload('before')} disabled={!jobId}>Upload Before</Button>
      <Button mode="contained" onPress={()=>pickAndUpload('after')} disabled={!jobId}>Upload After</Button>
    </View>
  );
}
