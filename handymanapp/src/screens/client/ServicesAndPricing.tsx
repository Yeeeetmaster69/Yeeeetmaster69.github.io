
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text, List } from 'react-native-paper';
import { getPricing } from '../../services/pricing';

export default function ServicesAndPricing(){
  const [data,setData] = useState<any>({ priceList: [], hourlyRate: 50 });
  useEffect(()=>{ getPricing().then(setData) },[]);
  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="titleLarge">Services & Basic Pricing</Text>
      <Text>Hourly from ${data.hourlyRate}/hr</Text>
      {data.priceList.map((p:any, i:number)=>(<List.Item key={i} title={p.name} description={`~$${p.price}`} />))}
    </View>
  );
}
