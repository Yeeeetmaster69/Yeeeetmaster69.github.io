
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { startLocation, stopLocation } from '../../services/location';
import { clockIn, clockOut } from '../../services/timesheets';
import { auth } from '../../config/firebase';

export default function ClockInOut(){
  const [sheetId,setSheetId] = useState<string | null>(null);
  const [jobId,setJobId] = useState('');
  const [busy,setBusy] = useState(false);

  const onIn = async ()=>{
    setBusy(true);
    try{
      await startLocation();
      const id = await clockIn(jobId, auth.currentUser!.uid, 0,0);
      setSheetId(id);
      alert('Clocked in');
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  const onOut = async ()=>{
    setBusy(true);
    try{
      const meters = await stopLocation();
      if (sheetId) await clockOut(sheetId, 0,0, meters);
      alert(`Clocked out. Distance: ${(meters/1609.34).toFixed(2)} mi`);
      setSheetId(null);
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="titleLarge">Clock In / Out</Text>
      <TextInput label="Job ID" value={jobId} onChangeText={setJobId} />
      <Button mode="contained" onPress={onIn} disabled={!jobId || !!sheetId} loading={busy}>Clock In (GPS)</Button>
      <Button mode="contained" onPress={onOut} disabled={!sheetId} loading={busy}>Clock Out</Button>
    </View>
  );
}
