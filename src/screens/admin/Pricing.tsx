
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { getPricing, setPricing } from '../../services/pricing';

export default function Pricing(){
  const [hr,setHr] = useState('50');
  const [json,setJson] = useState('[{"name":"Mow Lawn","price":75}]');

  useEffect(()=>{ getPricing().then(p=>{ setHr(String(p.hourlyRate||50)); setJson(JSON.stringify(p.priceList||[],null,2)); }) },[]);

  const save = async ()=>{
    try{
      const priceList = JSON.parse(json);
      await setPricing({ hourlyRate: Number(hr), priceList });
      alert('Saved');
    }catch(e:any){ alert('Bad JSON: '+e.message) }
  };

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <TextInput label="Default Hourly Rate" value={hr} onChangeText={setHr} keyboardType='numeric' />
      <TextInput label="Price List (JSON)" value={json} onChangeText={setJson} multiline style={{height:200}} />
      <Button mode="contained" onPress={save}>Save</Button>
    </View>
  );
}
